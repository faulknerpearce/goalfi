const { getContractInstance } = require("../utils/getContractInstance");

// Fetches the requested data with the request id and manually assigns it to all the users in the target goal.
async function assignDistance(request_id) {

    const contract = getContractInstance();

    const Response = await contract.getActivityWithRequestId(request_id);
    
    const dataArray = JSON.parse(Response.activityData);
    const goalId = Response.goalId;

    console.log(`Goal Id: ${goalId}`);
    console.log(`Response Data: ${dataArray}`);
    console.log(`Assign Distance Called.`);

    // const dataArray = [0,0]
    // const goalId = 1

    const tx = await contract.assignDistance(dataArray, goalId);
    
    console.log(`Assign Distance Executed. Transaction Hash: ${tx.hash}`);
}

async function main(){

    const request_id = '';

    await assignDistance(request_id);
}

main()
