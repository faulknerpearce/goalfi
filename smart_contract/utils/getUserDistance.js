const { getContractInstance } = require("./getContractInstance");

const contract = getContractInstance();

async function getUserDistance(walletAddress, goalId) {
    try {
        console.log(`Getting the total distance for wallet address: ${walletAddress}`)
        
        const distance = await contract.getUserDistance(walletAddress, goalId);
        console.log("User Distance:", distance.toString());
    } catch (error) {
        console.error("Error reading user distance:", error);
    }
}

// Hardcoded for testing
const walletAddress = '0x96af4089a5bE5e29efB631Fee00FF0b1005985BB';
const goalId = '1';

getUserDistance(walletAddress, goalId).catch(console.error);