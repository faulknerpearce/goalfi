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

// Asynchronously creates a new goal in the smart contract.
async function create_goal(activity, description, distance, startTimestamp, expiryTimestamp) {

  const contract = getContractInstance();

  const tx = await contract.createGoal(activity, description, distance, startTimestamp, expiryTimestamp);

  console.log(`Create Goal Called.\nTransaction Hash: ${tx.hash}`);

  await tx.wait();

}

// Main function to execute the process of creating a goal.
async function main(){

  const activity = await askQuestion("Enter the activity: ");
  const description = await askQuestion("Enter the description: ");
  const distance = await askQuestion("Enter the distance (in meters): ");
  const startTimestamp = await askQuestion("Enter the start timestamp: ");
  const expiryTimestamp = await askQuestion("Enter the expiry timestamp: ");

  await create_goal(activity, description, distance, startTimestamp, expiryTimestamp);
  
  console.log("Create Goal Executed.");

}

main()
.then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
