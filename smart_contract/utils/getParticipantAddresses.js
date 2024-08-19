const { getContractInstance } = require("./getContractInstance");
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
  
async function getParticipantAddresses(goalId) {

    const contract = getContractInstance();

    const addresses = await contract.getParticipantAddresses(goalId);

    console.log(`Addresses: ${addresses}`);

}

async function main(){
    
    const goalId = askQuestion('Enter the Goal ID: ');

    await getParticipantAddresses(goalId);

}

main()
.then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
