const { getContractInstance } = require("./getContractInstance");

// Asynchronously retrieves and logs the total user count in the smart contract.
async function getUserCount() {
    try {
        const contract = getContractInstance();

        console.log(`Getting the user count for contract address: ${contract.address}`)

        const userCount = await contract.userCount();
        
        console.log(`User Count: ${userCount.toString()}`);
    } catch (error) {
        console.error("Error getting user count:", error);
    }
}

// Execute the main function and handle the process exit based on success or error
getUserCount()
    .then(() => process.exit(0))  
    .catch((error) => {
        console.error(error);  
        process.exit(1);  
    });
