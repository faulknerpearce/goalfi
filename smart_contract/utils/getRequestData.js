const { getContractInstance } = require("./getContractInstance");

// Function to get the last recorded activity data from the smart contract
async function getRequestData() {

  // Get an instance of the smart contract.
  const contract = getContractInstance();

  console.log("Requesting last activity data.");

  const requestId = '0xdb7fb0cca6bcfd5b66701e9010c84d636f3b16bc386ffda3e3a3eb89023e8a98';

  // Fetch the last activity data from the contract.
  const Response = await contract.getActivityWithRequestId(requestId);

  console.log(`Goal Id: ${Response.goalId}`);
  console.log(`Activity Type: ${Response.activityType}`);
  console.log(`Response Data: ${Response.activityData}`);

}

getRequestData().catch(console.error);
