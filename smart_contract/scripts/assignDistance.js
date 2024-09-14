const { getContractInstance } = require("../utils/getContractInstance");

async function assignDistance(id) {

    const contract = getContractInstance();

    const Response = await contract.getActivityWithGoalId(id);
    
    const dataArray = JSON.parse(Response.activityData);
    const goalId = Response.goalId;

    console.log(`Goal Id: ${goalId}`);
    console.log(`Response Data: ${dataArray}`);
    console.log(`Assign Distance Called.`);

    const tx = await contract.assignDistance(dataArray, goalId);
    
    console.log(`Assign Distance Executed. Transaction Hash: ${tx.hash}`);
}

async function main(){

    const id = 11;

    await assignDistance(id);

}

main()
