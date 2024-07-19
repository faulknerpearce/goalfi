// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract StravaConsumer is Ownable(), FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public lastRequestId;
    bytes public lastResponse;
    bytes public lastError;

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        bytes response;
        bytes err;
    }

    struct ActivityStruct {
        string activityType;
        string activityData;
    }

    mapping(bytes32 => RequestStatus) public requests;
    mapping(bytes32 => ActivityStruct) public activities;
    bytes32[] public requestIds;

    event Response(
        bytes32 indexed requestId,
        string activityData,
        bytes response,
        bytes err
    );

    event RequestSent(
        bytes32 indexed requestId,
        string activityType
    );
    
    // Hardcoded for Sepolia
    address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0; // sepolia network 
    bytes32 donID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000; // sepolia network
    uint32 gasLimit = 300000;
    uint64 public subscriptionId;

    string public source;
 
    constructor(uint64 functionsSubscriptionId, string memory _source) FunctionsClient(router) {
        subscriptionId = functionsSubscriptionId;
        source = _source;
    }

    function setSource(string memory _source) external onlyOwner {
        source = _source;
    }

    function getStravaActivity(string memory accessToken, string memory activityType) external returns (bytes32 requestId) {
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
}
