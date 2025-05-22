const { getContractInstance } = require("./getContractInstance");

// Listens for blockchain contract responses and assigns distance data to users
const assignDistance = () => {
    const contract = getContractInstance();

    // Event listener for when the contract emits a Response event
    contract.on('Response', async (requestId, activityData, response, err) => {
        console.log(`Request Fulfilled.`);

        if (requestId) {
            try {
                console.log(`Assigning Distance for Request ID: ${requestId}.`);
                
                // Retrieve activity data associated with the request ID
                const Response = await contract.getActivityWithRequestId(requestId);

                const parsedArray = JSON.parse(Response.activityData)
                
                console.log(`Data: ${parsedArray}`)

                // Call contract method to assign distance to users for this goal
                await contract.assignDistance(parsedArray, Response.goalId);
                
                console.log('Distance Assigned to the Users.\n')

            } catch (error) {
                console.error("Error handling the fulfilled request:", error);
            }
        } else {
            // Handle error cases when requestId is not available
            console.error("An error occurred while fulfilling the request:", err);
        }
    });
};

module.exports = assignDistance;