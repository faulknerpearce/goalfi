const { ethers } = require("ethers");
const contractABI = require("./Goalfi.json").abi;

const providerUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
const contractAddress = '0xde621Ea9b0a43a285207630146eE1FA1CFd95964';

// Delay helper function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    try {
        // Introduce a delay before checking for the event
        await delay(60000); // 1-minute delay (adjust as needed)

        // Connect to the network
        const provider = new ethers.JsonRpcProvider(providerUrl);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        // Fetch the last request ID from the smart contract
        const lastRequestId = await contract.lastRequestId();

        // Fetch activity data using the last request ID
        const response = await contract.getActivityWithRequestId(lastRequestId);

        // Convert BigInt values to strings
        const data = {
            goalId: response.goalId.toString(),
            activityData: response.activityData,
        };

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Enable CORS
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Error fetching last response:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",  // Enable CORS
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
