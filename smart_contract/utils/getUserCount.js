const { getContractInstance } = require("./getContractInstance");

async function getUserCount() {
    try {
        // Get the contract instance to interact with the smart contract.
        const contract = getContractInstance();

        console.log(`Getting the user count for contract address: ${contract.address}`)

        // Call the userCount method from the smart contract to get the number of users.
        const userCount = await contract.userCount();
        
        console.log(`User Count: ${userCount.toString()}`);
    } catch (error) {
        console.error("Error getting user count:", error);
    }
}

getUserCount()
    .then(() => process.exit(0))  
    .catch((error) => {
        console.error(error);  
        process.exit(1);  
    });
