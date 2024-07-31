const fs = require('fs');
const path = require('path');

// Deploys the smart contract with the subscription ID and teh Javascript source code.
async function main() {

    // Read the source code from the 'source.js' file in the current directory.
    const source = fs.readFileSync(path.resolve(__dirname, 'source.js'), 'utf8');
    
    const subscriptionId = process.env.FUJI_SUBSCRIPTION_ID; // using the avalanche fuji testnet.
    
    const GoalfiFactory = await ethers.getContractFactory("Goalfi");
    
    const GoalfiContract = await GoalfiFactory.deploy(subscriptionId, source);
    
    console.log('Deploying Contract.');

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
    