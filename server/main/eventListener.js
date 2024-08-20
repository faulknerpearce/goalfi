const { getContractInstance } = require("./getContractInstance");

const assignDistance = () => {
    const contract = getContractInstance();

    contract.on('Response', async (requestId, activityData, response, err) => {
        console.log(`Request Fulfilled!`);

        if (requestId) {
            try {
                console.log(`Assigning Distance for Request ID: ${requestId}.`);
                
                const Response = await contract.getActivityWithRequestId(requestId);

                const parsedArray = JSON.parse(Response.activityData)

                await contract.assignDistance(parsedArray, Response.goalId);
                
                console.log('Distance Assigned to the Users.')

            } catch (error) {
                console.error("Error handling the fulfilled request:", error);
            }
        } else {
            console.error("An error occurred while fulfilling the request:", err);
        }
    });
};

module.exports = assignDistance;
 