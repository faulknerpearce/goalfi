const { getContractInstance } = require("./getContractInstance");
const { ethers } = require('ethers');
const readline = require("readline");

// Function to prompt the user for input.
function askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }));
}

// Asynchronously retrieves and logs the total rewards for a given wallet address.
async function getTotalRewards(walletAddress) {
    try {

        console.log(`Getting the Total Rewards for Wallet Address: ${walletAddress}`)
        const contract = getContractInstance();
        
        const total = await contract.getUserTotalRewards(walletAddress);
        const totalParsed = ethers.utils.formatUnits(total, 18);
        
        console.log(`Total Rewards: ${totalParsed} AVAX`); 
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Main function to execute the total rewards retrieval process.
async function main() {
    const walletAddress = await askQuestion('Enter the Wallet Address: ');
    await getTotalRewards(walletAddress);
}

// Execute the main function and handle the process exit based on success or error.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
