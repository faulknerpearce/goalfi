require("@chainlink/env-enc").config();
const path = require('path');
const fs = require('fs');

async function main() {

    const source = fs.readFileSync(path.resolve(__dirname, 'source.js'), 'utf8');

    const subscriptionId = process.env.SUBSCRIPTION_ID;

    const StravaConsumerFactory = await ethers.getContractFactory("StravaConsumer");
    const StravaConsumerContract = await StravaConsumerFactory.deploy(subscriptionId, source);
    
    console.log('Deploying Contract.');
  
    await StravaConsumerContract.waitForDeployment();
  
    console.log('Contract deployed successfully.');
    console.log("Contract address:", await StravaConsumerContract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
    