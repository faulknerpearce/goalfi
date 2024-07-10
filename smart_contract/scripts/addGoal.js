const { ethers } = require("ethers");
const readline = require("readline");
const dotenv = require("dotenv");

dotenv.config();

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

async function main() {
  // Load the wallet private key from environment variables
  const walletPrivateKey = process.env.PRIVATE_KEY;

  // Ensure the private key is available
  if (!walletPrivateKey) {
    throw new Error("Please set your PRIVATE_KEY in a .env file");
  }

  // Set up a provider (connecting to Sepolia network via Infura)
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_URL);

  // Create a wallet instance
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  // Address of the deployed contract
  const contractAddress = "0x82A2CC65190183057c9D9a0847BCdd6008E55d70"; // Replace with your deployed contract address

  // ABI of the deployed contract
  const contractABI = [
    {
      "inputs": [
        { "internalType": "string", "name": "_activity", "type": "string" },
        { "internalType": "string", "name": "_description", "type": "string" },
        { "internalType": "uint256", "name": "_distance", "type": "uint256" },
        { "internalType": "uint256", "name": "_startTimestamp", "type": "uint256" },
        { "internalType": "uint256", "name": "_expiryTimestamp", "type": "uint256" }
      ],
      "name": "createGoal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // Prompt the user for input values
  const activity = await askQuestion("Enter the activity: ");
  const description = await askQuestion("Enter the description: ");
  const distance = await askQuestion("Enter the distance (in meters): ");
  const startTimestamp = await askQuestion("Enter the start timestamp: ");
  const expiryTimestamp = await askQuestion("Enter the expiry timestamp: ");

  // Call the createGoal function
  const tx = await contract.createGoal(activity, description, distance, startTimestamp, expiryTimestamp);

  // Wait for the transaction to be mined
  await tx.wait();

  console.log("Goal created successfully!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
