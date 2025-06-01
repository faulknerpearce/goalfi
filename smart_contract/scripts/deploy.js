const fs = require('fs');
const path = require('path');
const { ethers } = require("hardhat");

async function main() {
  
    // Read the source code from the 'source.js' file in the current directory.
    const source = fs.readFileSync(path.resolve(__dirname, 'source.js'), 'utf8');
    
    const subscriptionId = process.env.FUJI_SUBSCRIPTION_ID;
    
    const GoalfiFactory = await ethers.getContractFactory("Goalfi");
    
    console.log('Deploying Contract...');
    const deployTx = await GoalfiFactory.deploy(subscriptionId, source);
    
    // Wait for the deployment transaction to be mined.
    const GoalfiContract = await deployTx.waitForDeployment();
    console.log('Contract deployed successfully.');

    // Log the contract address.
    const contractAddress = await GoalfiContract.getAddress();
    console.log("Contract address:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });