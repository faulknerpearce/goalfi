require("@chainlink/env-enc").config();
const fs = require('fs');

async function main() {

    const source = fs.readFileSync('source.js', 'utf8');

    const subscriptionId = process.env.SUBSCRIPTION_ID;

    const GoalfiFactory = await ethers.getContractFactory("StravaConsumer");
    const GoalfiContract = await GoalfiFactory.deploy(subscriptionId, source);
    
    console.log('Deploying Contract.');
  
    await GoalfiContract.waitForDeployment();
  
    console.log('Contract deployed successfully.');
    console.log("Contract address:", await GoalfiContract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
    