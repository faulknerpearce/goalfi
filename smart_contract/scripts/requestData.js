const { getContractInstance } = require("../utils/getContractInstance");
const dotenv = require("dotenv");

dotenv.config();

async function requestActivityData(AccsessToken, activityType, walletAddress, goalId) {
  const contract = getContractInstance();

  console.log(`Requesting activity data for sport type: ${activityType}`);

  const tx = await contract.executeRequest(AccsessToken, activityType, walletAddress, goalId);

  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

// Hardcoded for testing 
const accsessToken = process.env.ACCESS_TOKEN; // Update this daily.
const activityType = 'Run';
const walletAddress = '0x96af4089a5bE5e29efB631Fee00FF0b1005985BB'; 
const goalId = '0'; // Change for new goals.

requestActivityData(accsessToken, activityType, walletAddress, goalId)
.then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});