const { getContractInstance } = require("./getContractInstance");
const dotenv = require("dotenv");
dotenv.config();

// Function to request activity data using chainlink functions with the smart contract.
async function requestActivityData(dataList, activityType) {
  
  // Get an instance of the smart contract.
  const contract = getContractInstance();

  console.log(`Requesting activity data for sport type: ${activityType}` );

  // Send the activity data request to the smart contract.
  const tx = await contract.executeRequest(dataList, activityType);

  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

// Hardcoded data for testing. Takes a user id and the access token.
const userData = `{"1": "${process.env.ACCESS_TOKEN_ONE}", "2": "${process.env.ACCESS_TOKEN_TWO}", "3": "${process.env.ACCESS_TOKEN_THREE}"}`;
const activity = 'Run';

requestActivityData(userData, activity).catch(console.error);
