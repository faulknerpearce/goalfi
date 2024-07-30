const { getContractInstance } = require("../utils/getContractInstance");
const readline = require("readline");

// Function to prompt the user for input
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

// Asynchronously closes a goal in the smart contract.
async function closeGoal(goalId){

    const contract = getContractInstance();

    const tx = await contract.closeGoal(goalId);

    console.log(`Close Goal Called.\nTransaction Hash: ${tx.hash}`);

    await tx.wait();
}

// Main function to execute the process of closing a goal.
async function main(){

    const goalId = await askQuestion('Enter the Goal ID: ')
    
    await closeGoal(goalId);

    console.log("Close Goal Executed.");
}

// Execute the main function and handle the process exit based on success or error.
main()
.then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});