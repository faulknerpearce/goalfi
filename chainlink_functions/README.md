how to add a chainlink consumer.

# Packages to install.

1. npm install @chainlink/functions-toolkit
2. npm install --save-dev hardhat, then start hardhat: run npx hardhat init
3. npm install dotenv
4. npm install @chainlink/env-enc

# Instructions

1. Create a subscription at https://functions.chain.link/
2. Get the DON ID and the Router Address from the subscription page and paste them into the smart contract.
3. Deploy the smart contract using the chainlink functions, make sure to deploy the contract with the chainlink subscription id (set the sub ID in the env file).
4. Add the consumer to your subscription by copying the smart contract address and pasting it into the add consumer section at https://functions.chain.link

5. Next we encrypt our environment variables. Set the encryption password by running: npx env-enc set-pw 
6. Set the encrypted values to your secrets one by one using the following command: npx env-enc set

7. Make sure to have ethers v6 instaleld.