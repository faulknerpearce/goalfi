const fs = require('fs');
const path = require('path');

async function main() {

    const source = fs.readFileSync(path.resolve(__dirname, 'source.js'), 'utf8');
    const subscriptionId = process.env.FUJI_SUBSCRIPTION_ID; // using the avalanche fuji testnet.

    // Deploy the contract using the factory.
    const GoalfiFactory = await ethers.getContractFactory("Goalfi");
    const GoalfiContract = await GoalfiFactory.deploy(subscriptionId, source);
    
    console.log('Deploying Contract.');

    // Wait until the contract is deployed.
    await GoalfiContract.deployed();
    console.log('Contract deployed successfully.');
    
    // Log the address of the deployed contract.
    console.log("Contract address:", GoalfiContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
    