const { getContractInstance } = require("./getContractInstance");

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

// Asynchronously retrieves and logs the total distance covered by a user for a specific goal.
async function getUserDistance(walletAddress, goalId) {
    try {
        const contract = getContractInstance();

        console.log(`Getting the total distance for wallet address: ${walletAddress}`)
        
        const distance = await contract.getUserDistance(walletAddress, goalId);
        
        console.log("User Distance:", distance.toString());

    } catch (error) {
        console.error("Error reading user distance:", error);
    }
}

// Main function to execute the user distance retrieval process.
async function main(){

    const walletAddress = await askQuestion('Enter the Wallet Address: ');
    const goalId =  await askQuestion('Enter the Goal ID: ');

    await getUserDistance(walletAddress, goalId)
}

// Execute the main function and handle the process exit based on success or error.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});