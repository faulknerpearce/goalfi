const { getContractInstance } = require("./getContractInstance");

async function listenForFulfillment() {
    
    const contract = getContractInstance();

    // Listen for the Response event
    contract.on('Response', (requestId, activityData, response, err) => {
        console.log(`Request Fulfilled!`);
        console.log(`Request ID: ${requestId}`);
        console.log(`Activity Data: ${activityData}`);
        console.log(`Response: ${response}`);
        console.log(`Error: ${err ? ethers.utils.toUtf8String(err) : 'No Error'}`);
    });
}

listenForFulfillment(); // Call the function to start listening for events
