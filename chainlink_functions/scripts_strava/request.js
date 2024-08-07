const dotenv = require("dotenv");
const { getContractInstance } = require("./getContractInstance");

dotenv.config();

async function requestActivityData(AccsessToken, activityType, walletAddress, goalId) {
  
  const contract = getContractInstance();

  console.log(`Requesting activity data for sport type: ${activityType}` );

  const tx = await contract.executeRequest(AccsessToken, activityType);
  
  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

const AccsessToken = process.env.ACCESS_TOKEN;

const activityType = 'Run'; // Hardcoded for testing.
const walletAddress = '0x96af4089a5bE5e29efB631Fee00FF0b1005985BB';// Hardcoded for testing.
const goalId = '0';// Hardcoded for testing.

requestActivityData(AccsessToken, activityType, walletAddress, goalId).catch(console.error);
