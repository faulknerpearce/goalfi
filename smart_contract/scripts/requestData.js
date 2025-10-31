const { getContractInstance } = require("../utils/getContractInstance.js");
const dotenv = require("dotenv");
const readline = require("readline");
dotenv.config();

// Prompts the user for input.
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

// Sends a request to the smart contract to fetch the activity data for the given activity type.
async function requestActivityData(data, activityType, goalId) {
  
  const contract = getContractInstance();

  try {
    console.log(`Requesting activity data for sport type: ${activityType}`);

    const tx = await contract.executeRequest(data, activityType, goalId);
    console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);

  } catch (error) {
    console.error("Error sending activity data request:", error);
  }
}

// Main function to execute the request data script.
async function main() {

  const requestData = [];
  const UserId = await askQuestion('Enter User ID: ');
  requestData.push(UserId)
  const accsessToken = await askQuestion('Enter the Access Token: ');
  requestData.push(accsessToken)
  const activityType = await askQuestion('Enter the Activity Type: ');
  const goalId = await askQuestion('Enter the Goal ID: ');

  const startTimestamp = 0; // need to input value for testing.
  const expiryTimestamp = 0; // need to input value for testing.

  await requestActivityData(requestData, activityType, goalId, startTimestamp, expiryTimestamp);

  console.log("Request Data Executed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Main function error:", error);
    process.exit(1);
  });
