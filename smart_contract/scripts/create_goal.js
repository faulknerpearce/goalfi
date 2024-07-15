const { ethers } = require("ethers");
const readline = require("readline");
const dotenv = require("dotenv");
const abi = require("../contract_abi/Goalfi.json");

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

async function create_goal(activity, description, distance, startTimestamp, expiryTimestamp) {

  // Set up a provider (connecting to Sepolia network via Infura)
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_URL);

  // Create a wallet instance
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Address of the deployed contract
  const contractAddress = process.env.GOALFI_CONTRACT_ADDRESS

  const contractABI = abi.abi

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // Call the createGoal function
  const tx = await contract.createGoal(activity, description, distance, startTimestamp, expiryTimestamp);

  console.log(`Create Goal Called.\nTransaction Hash: ${tx.hash}`);

  // Wait for the transaction to be mined
  await tx.wait();

}

async function main(){

  const activity = await askQuestion("Enter the activity: ");
  const description = await askQuestion("Enter the description: ");
  const distance = await askQuestion("Enter the distance (in meters): ");
  const startTimestamp = await askQuestion("Enter the start timestamp: ");
  const expiryTimestamp = await askQuestion("Enter the expiry timestamp: ");

  await create_goal(activity, description, distance, startTimestamp, expiryTimestamp)
  
  console.log("Create Goal Executed.");

}

main()
.then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
