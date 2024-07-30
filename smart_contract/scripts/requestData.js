const { getContractInstance } = require("../utils/getContractInstance");
const dotenv = require("dotenv");
const readline = require("readline");

dotenv.config();

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

async function requestActivityData(AccsessToken, activityType, walletAddress, goalId) {
  
  const contract = getContractInstance();

  console.log(`Requesting activity data for sport type: ${activityType}`);

  const tx = await contract.executeRequest(AccsessToken, activityType, walletAddress, goalId);

  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

async function main(){

  const accsessToken = await askQuestion('Enter the Access Token: ');
  const activityType = await askQuestion('Enter the Activity Type: ');
  const walletAddress = await askQuestion('Enter the Wallet Adddress: ');
  const goalId = await askQuestion('Enter the Goal ID: ');

  await requestActivityData(accsessToken, activityType, walletAddress, goalId);
  
  console.log("Request Data Executed.");
}

main()
.then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});