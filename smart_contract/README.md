How to deploy the smart contract.

1. Ensure that the hardhat config file has the network you wish to deploy the conteract on. 
2. In the .env file add your wallets private key and your desired network api key.
3. adjsut the scripts/deploy.js to handle deploying your contract. 
4. In the smart contract folder run the command: npx hardhat run scripts/deploy.js --network sepolia

