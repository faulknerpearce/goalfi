// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract Goalfi is Ownable(), FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct User {
        address walletAddress;
        mapping(uint => GoalParticipation) goalParticipations;
    }

    struct Goal {
        uint goalId;
        string activity;
        string description;
        uint distance;
        uint stake;
        uint failedStake;
        mapping(address => GoalParticipation) participants;
        address[] participantAddresses;
        uint startTimestamp;
        uint expiryTimestamp;
        bool set;
    }

    struct GoalParticipation {
        uint stakedAmount;
        uint userDistance;
        UserProgress progress;
    }

    enum UserProgress {
        ANY,
        JOINED,
        FAILED,
        COMPLETED,
        CLAIMED
    }

    struct RequestDetails {
        address walletAddress;
        uint goalId;
    }

    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;
    uint32 gasLimit = 300000;
    uint64 public subscriptionId;

    bytes32 public lastRequestId;
    bytes public lastResponse;
    bytes public lastError;

    uint public userCount;
    uint public goalCount;
    uint public activeGoalCount;
    
    uint public constant MAX_ACTIVE_GOALS = 10;
    uint public constant FEE_PERCENTAGE = 2;

    mapping(address => User) public users;
    mapping(uint => Goal) public goals;
    mapping(address => bool) public userAddressUsed;
    mapping(address => bool) public uncompletedUsersId;

    mapping(bytes32 => RequestStatus) public requests;
    mapping(bytes32 => RequestDetails) public requestDetails;
    bytes32[] public requestIds;

    event Response( bytes32 indexed requestId, string activityData, bytes response, bytes err);
    event RequestSent(bytes32 indexed requestId, string activityType );
    event UserCreated(address indexed walletAddress);
    event GoalCreated(uint indexed goalId, string activity, string description, uint distance, uint stake, uint startTimestamp, uint expiryTimestamp);
    event UserJoinedGoal(address indexed walletAddress, uint indexed goalId, uint stake);
    event UserProgressUpdated(address indexed walletAddress, uint indexed goalId, UserProgress newStatus);
    event RewardsClaimed(address indexed walletAddress, uint indexed goalId);
    event GoalEvaluated(uint indexed goalId);

    modifier userNotCreated(address _walletAddress) {
        require(!userAddressUsed[_walletAddress], "User can only create an account once");
        _;
    }

    modifier userExists(address _walletAddress) {
        require(users[_walletAddress].walletAddress != address(0), "User must exist");
        _;
    }

    modifier goalExists(uint goalId) {
        require(goals[goalId].set, "goalExists: invalid goal id, goal does not exist");
        _;
    }

    modifier markFailedIfExpired(uint _goalId, address _walletAddress) {
        require(goals[_goalId].set, "markFailedIfExpired: invalid goal id, goal does not exist");
        if (goals[_goalId].expiryTimestamp < block.timestamp) {
            closeGoal(_goalId);
        }
        _;
    }

    string public source =
        "const accessToken = args[0];"
        "const activityType = args[1];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: 'https://www.strava.com/api/v3/athlete/activities',"
        "headers: { Authorization: `Bearer ${accessToken}` },"
        "responseType: 'json'"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const data = apiResponse.data;"
        "const activity = data.find(activity => activity.sport_type === activityType);"
        "if (activity) {"
        "const distance = Math.round(Number(activity.distance));" 
        "return Functions.encodeUint256(distance);"
        "} else {"
        "return Functions.encodeString(`No activities found for type: ${activityType}.`);"
        "}";

    constructor(uint64 functionsSubscriptionId) FunctionsClient(router) {
        subscriptionId = functionsSubscriptionId;
    }

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        bytes response;
        bytes err;
    }

    function createGoal(string memory _activity, string memory _description, uint _distance, uint _startTimestamp, uint _expiryTimestamp) public onlyOwner {
        require(activeGoalCount < MAX_ACTIVE_GOALS, "Maximum number of active goals reached");

        Goal storage newGoal = goals[goalCount];
        newGoal.goalId = goalCount;
        newGoal.activity = _activity;
        newGoal.description = _description;
        newGoal.distance = _distance;
        newGoal.stake = 0;
        newGoal.failedStake = 0;
        newGoal.participantAddresses = new address[](0) ;
        newGoal.startTimestamp = _startTimestamp;
        newGoal.expiryTimestamp = _expiryTimestamp;
        newGoal.set = true;

        emit GoalCreated(goalCount, _activity, _description, _distance, 0, _startTimestamp, _expiryTimestamp);
        
        activeGoalCount++;
        goalCount++;
    }

    function createUser() public userNotCreated(msg.sender) {
        require(msg.sender.balance >= 1000000000000000, "User must have at least 0.001 ETH in their wallet");

        users[msg.sender].walletAddress = msg.sender;

        userCount++;

        userAddressUsed[msg.sender] = true;

        emit UserCreated(msg.sender);
    }

    function joinGoal(uint _goalId) public payable userExists(msg.sender) goalExists(_goalId) {
        require(block.timestamp < goals[_goalId].startTimestamp, "Cannot join a goal that has already started.");
        require(goals[_goalId].expiryTimestamp > block.timestamp, "Cannot join an expired goal");
    
        require(msg.value > 0, "You must stake to join the pool.");

        require(goals[_goalId].participants[msg.sender].progress == UserProgress.ANY, "User has already participated in the goal");

        uncompletedUsersId[msg.sender] = true;

        goals[_goalId].participants[msg.sender] = GoalParticipation(msg.value, 0, UserProgress.JOINED);

        goals[_goalId].participantAddresses.push(msg.sender);

        goals[_goalId].stake += msg.value;

        emit UserJoinedGoal(msg.sender, _goalId, msg.value);
    }

    function closeGoal(uint _goalId) public onlyOwner goalExists(_goalId) {
        require(block.timestamp >= goals[_goalId].expiryTimestamp, "evaluateGoalCompletion: Goal must be expired");

        Goal storage goal = goals[_goalId];

        for (uint i = 0; i < goal.participantAddresses.length; i++) {
            address userAddress = goal.participantAddresses[i];

            if (goal.participants[userAddress].progress == UserProgress.JOINED) {
                if (goal.participants[userAddress].userDistance >= goal.distance) {
                    goal.participants[userAddress].progress = UserProgress.COMPLETED;
                } else {
                    goal.participants[userAddress].progress = UserProgress.FAILED;
                    goal.failedStake += goal.participants[userAddress].stakedAmount;
                    goal.participants[userAddress].stakedAmount = 0;
                }
            }
        }
        activeGoalCount--;
        emit GoalEvaluated(_goalId);
    }

    // Given the user progress enum and the goal id, it counts matching users on that state, if you pass ANY it counts all users.
    function countGoalParticipantsAtProgress(uint _goalId, UserProgress progress) public view goalExists(_goalId) returns (uint) {
        Goal storage goal = goals[_goalId];
        uint matches = 0;
        for (uint i = 0; i < goal.participantAddresses.length; i++) {
            address userAddress = goal.participantAddresses[i];
            if (goal.participants[userAddress].progress == progress ||
                progress == UserProgress.ANY) {
                matches++; 
            }
        }
        return matches;
    }

    // Function to calculate the user's share of the rewards
    function calculateUserRewards(address userAddress, uint goalId) internal view returns (uint) {
        Goal storage goal = goals[goalId];
        uint userStakedAmount = goal.participants[userAddress].stakedAmount;
        uint failedStake = goal.failedStake;
        uint numCompletedParticipants = countGoalParticipantsAtProgress(goalId, UserProgress.COMPLETED);
        uint claimFees = (userStakedAmount * FEE_PERCENTAGE) / 100;
        uint rewardsFromFailedStake = failedStake / numCompletedParticipants;
        uint userRewards = (userStakedAmount + rewardsFromFailedStake) - claimFees;

        return userRewards;
    }

    // Function to allow a user to claim rewards after completing a goal
    function claimRewards(uint _goalId) public payable userExists(msg.sender) goalExists(_goalId) {
        
        // Ensure the goal has expired. We all claim in equal parts only because nobody can join anymore after expiration.
        require(block.timestamp >= goals[_goalId].expiryTimestamp, "claimRewards: Goal must be expired");

        // Ensure the user has not already claimed their rewards.
        Goal storage goal = goals[_goalId];

        // Ensure the user has completed the goal
        require(goal.participants[msg.sender].progress != UserProgress.CLAIMED, "User has already claimed rewards");
        require(goal.participants[msg.sender].progress == UserProgress.COMPLETED, "User must have completed the goal");

        // Ensure the user has staked Ether in the goal
        uint userStakedAmount = goal.participants[msg.sender].stakedAmount;
        require(userStakedAmount > 0, "User must have staked Ether in the goal");

        // Calculate the user's share of the rewards from the failed stakes.
        uint userRewards = calculateUserRewards(msg.sender, _goalId);

        // Transfer the rewards to the user.
        payable(msg.sender).transfer(userRewards);

        // Decrease the goal's stake by the user's rewards.
        goal.stake -= userRewards;
        goal.participants[msg.sender].progress = UserProgress.CLAIMED;

        emit RewardsClaimed(msg.sender, _goalId);
    }

    // Function to get the participant addresses of a goal
    function getParticipantAddresses(uint _goalId) public view goalExists(_goalId) returns (address[] memory) {
        return goals[_goalId].participantAddresses;
    }

    function getStravaActivity(string memory accessToken, string memory activityType, address walletAddress, uint goalId) public returns (bytes32 requestId) {
        require(users[walletAddress].walletAddress != address(0), "getStravaActivity: user must exist");
        require(goals[goalId].set, "getStravaActivity: goal must exist");

        string[] memory args = new string[](2);
        args[0] = accessToken;
        args[1] = activityType;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args);

        lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        requests[lastRequestId] = RequestStatus({
            exists: true,
            fulfilled: false,
            response: "",
            err: ""
        });

        requestDetails[lastRequestId] = RequestDetails({
            walletAddress: walletAddress,
            goalId: goalId
        });

        requestIds.push(lastRequestId);

        emit RequestSent(lastRequestId, activityType);

        return lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        require(requests[requestId].exists, "request not found");

        lastError = err;
        lastResponse = response;

        if (response.length > 0) {
            // Decode the response as uint256
            uint256 distance = abi.decode(response, (uint256));
            
            // Retrieve the details of the request
            RequestDetails memory details = requestDetails[requestId];
            address walletAddress = details.walletAddress;
            uint goalId = details.goalId;

            // Ensure the user and goal exist
            require(users[walletAddress].walletAddress != address(0), "fulfillRequest: user must exist");
            require(goals[goalId].set, "fulfillRequest: goal must exist");

            // Update the user's distance for the goal
            goals[goalId].participants[walletAddress].userDistance = distance;
        }

        requests[requestId].fulfilled = true;
        requests[requestId].response = response;
        requests[requestId].err = err;

        emit Response(requestId, string(response), response, err);
    }

    function getUserDistance(address walletAddress, uint goalId) public view goalExists(goalId) userExists(walletAddress) returns (uint) {
        return goals[goalId].participants[walletAddress].userDistance;
    }

}
