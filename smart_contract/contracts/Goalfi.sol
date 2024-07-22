// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract Goalfi is Ownable(msg.sender), FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct ActivityStruct {
        string activityType;
        string activityData;
    }

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

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        bytes response;
        bytes err;
    }

    struct RequestDetails {
        address walletAddress;
        uint goalId;
    }

    // Hardcoded for Fuji
    address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0; // Fuji network 
    bytes32 donID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000; // Fuji network
    uint32 gasLimit = 300000;

    bytes32 public lastRequestId;
    uint64 public subscriptionId;
    string public source;

    bytes32[] public requestIds;
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

    mapping(bytes32 => RequestStatus) public requests;
    mapping(bytes32 => ActivityStruct) public activities;
    mapping(bytes32 => RequestDetails) public requestDetails;
    

    event Response(bytes32 indexed requestId,string activityData,bytes response,bytes err);
    event RequestSent(bytes32 indexed requestId,string activityType);

    event UserCreated(address indexed walletAddress);
    event GoalCreated(uint indexed goalId, string activity, string description, uint distance, uint startTimestamp, uint expiryTimestamp);
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
 
    constructor(uint64 functionsSubscriptionId, string memory _source) FunctionsClient(router) {
        subscriptionId = functionsSubscriptionId;
        source = _source;
    }

    function setSource(string memory _source) external onlyOwner {
        source = _source;
    }

    function createGoal(string memory _activity, string memory _description, uint _distance, uint _startTimestamp, uint _expiryTimestamp) public onlyOwner {
        require(activeGoalCount < MAX_ACTIVE_GOALS, "Maximum number of active goals reached");

        Goal storage newGoal = goals[goalCount];
        newGoal.goalId = goalCount;
        newGoal.activity = _activity;
        newGoal.description = _description;
        newGoal.distance = _distance;
        newGoal.startTimestamp = _startTimestamp;
        newGoal.expiryTimestamp = _expiryTimestamp;
        newGoal.set = true;

        emit GoalCreated(goalCount, _activity, _description, _distance, _startTimestamp, _expiryTimestamp);

        activeGoalCount++;
        goalCount++;
    }

    function createUser() public userNotCreated(msg.sender) {
        require(msg.sender.balance >= 1000000000000000, "User must have at least 0.001 ETH in their wallet");

        users[msg.sender].walletAddress = msg.sender;
        userAddressUsed[msg.sender] = true;
        userCount++;

        emit UserCreated(msg.sender);
    }

    function joinGoal(uint _goalId) public payable userExists(msg.sender) goalExists(_goalId) {
        require(block.timestamp < goals[_goalId].startTimestamp, "Cannot join a goal that has already started.");
        require(goals[_goalId].expiryTimestamp > block.timestamp, "Cannot join an expired goal");
        require(msg.value > 0, "You must stake to join the pool.");
        require(goals[_goalId].participants[msg.sender].progress == UserProgress.ANY, "User has already participated in the goal");

        goals[_goalId].participants[msg.sender] = GoalParticipation(msg.value, 0, UserProgress.JOINED);
        goals[_goalId].participantAddresses.push(msg.sender);
        goals[_goalId].stake += msg.value;

        emit UserJoinedGoal(msg.sender, _goalId, msg.value);
    }

    // Function to check if a user has completed a goal and mark them accordingly
    function evaluateUserProgress(address walletAddress, uint goalId) internal {
        Goal storage goal = goals[goalId];
        GoalParticipation storage participation = goal.participants[walletAddress];

        if (participation.progress == UserProgress.JOINED) {
            if (participation.userDistance >= goal.distance) {
                participation.progress = UserProgress.COMPLETED;
            } else {
                participation.progress = UserProgress.FAILED;
                goal.failedStake += participation.stakedAmount;
                participation.stakedAmount = 0;
            }
            emit UserProgressUpdated(walletAddress, goalId, participation.progress);
        }
    }

    // Function to evaluate and close a goal
    function closeGoal(uint _goalId) public onlyOwner goalExists(_goalId) {
        require(block.timestamp >= goals[_goalId].expiryTimestamp, "closeGoal: Goal must be expired");

        Goal storage goal = goals[_goalId];

        for (uint i = 0; i < goal.participantAddresses.length; i++) {
            address userAddress = goal.participantAddresses[i];
            evaluateUserProgress(userAddress, _goalId);
        }
        activeGoalCount--;
        emit GoalEvaluated(_goalId);
    }

    function countGoalParticipantsAtProgress(uint _goalId, UserProgress progress) public view goalExists(_goalId) returns (uint) {
        Goal storage goal = goals[_goalId];
        uint matches = 0;
        for (uint i = 0; i < goal.participantAddresses.length; i++) {
            address userAddress = goal.participantAddresses[i];
            if (goal.participants[userAddress].progress == progress || progress == UserProgress.ANY) {
                matches++;
            }
        }
        return matches;
    }

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

    function claimRewards(uint _goalId) public payable userExists(msg.sender) goalExists(_goalId) {
        require(block.timestamp >= goals[_goalId].expiryTimestamp, "claimRewards: Goal must be expired");

        Goal storage goal = goals[_goalId];

        require(goal.participants[msg.sender].progress != UserProgress.CLAIMED, "User has already claimed rewards");
        require(goal.participants[msg.sender].progress == UserProgress.COMPLETED, "User must have completed the goal");

        uint userStakedAmount = goal.participants[msg.sender].stakedAmount;
        require(userStakedAmount > 0, "User must have staked Ether in the goal");

        uint userRewards = calculateUserRewards(msg.sender, _goalId);

        payable(msg.sender).transfer(userRewards);

        goal.stake -= userRewards;
        goal.participants[msg.sender].progress = UserProgress.CLAIMED;

        emit RewardsClaimed(msg.sender, _goalId);
    }

    function executeRequest(string memory accessToken, string memory activityType, address walletAddress, uint goalId) external returns (bytes32 requestId) {
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

        activities[lastRequestId] = ActivityStruct({
            activityType: activityType,
            activityData: ""
        });
        
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
            ActivityStruct storage activity = activities[requestId];
            activity.activityData = string(response);

            uint256 distance = abi.decode(response, (uint256));

            RequestDetails memory details = requestDetails[requestId];
            address walletAddress = details.walletAddress;
            uint goalId = details.goalId;

            goals[goalId].participants[walletAddress].userDistance = distance;
        }

        requests[requestId].fulfilled = true;
        requests[requestId].response = response;
        requests[requestId].err = err;

        emit Response(requestId, string(response), response, err);
    }

    function getLastActivity() public view returns (ActivityStruct memory) {
        require(requestIds.length > 0, "No activities found");
        return activities[requestIds[requestIds.length - 1]];
    }

    function getUserDistance(address walletAddress, uint goalId) public view goalExists(goalId) userExists(walletAddress) returns (uint) {
        return goals[goalId].participants[walletAddress].userDistance;
    }

    function getParticipantAddresses(uint _goalId) public view goalExists(_goalId) returns (address[] memory) {
        return goals[_goalId].participantAddresses;
    }
}
