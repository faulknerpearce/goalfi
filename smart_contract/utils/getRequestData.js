const { getContractInstance } = require("./getContractInstance");

// Function to get the last recorded activity data from the smart contract
async function getRequestData() {

  // Get an instance of the smart contract.
  const contract = getContractInstance();

  console.log("Requesting last activity data.");

  const goalId = 0;

  // Fetch the last activity data from the contract.
  const Response = await contract.getActivityByGoalId(goalId);

  console.log(`Goal Id: ${Response.goalId}`);
  console.log(`Activity Type: ${Response.activityType}`);
  console.log(`Response Data: ${Response.activityData}`);

}

getRequestData().catch(console.error);
