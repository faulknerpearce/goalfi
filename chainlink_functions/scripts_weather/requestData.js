const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

async function requestTemperature(city) {
  // Wallet private key.
  const walletPrivateKey = process.env.PRIVATE_KEY;

  // Address of the deployed contract located in the env file. make sure to update it if witt the latest deployed contract.
  const contractAddress = process.env.WEATHER_CONTRACT_ADDRESS;

  // Set up a provider (connecting to Sepolia network via Infura)
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);

  // Create a wallet instance
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  // Relevant ABI for requesting temperature data
  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_city",
          "type": "string"
        }
      ],
      "name": "getTemperature",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "requestId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // Request temperature data
  const tx = await contract.getTemperature(city);
  console.log(`Temperature request sent for ${city}, transaction hash: ${tx.hash}`);
}

// Hardcoded city name
const city = "Perth"; // Replace with your city

requestTemperature(city).catch(console.error);
