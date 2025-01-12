const { ethers } = require("ethers");
const dotenv = require("dotenv");
const abi = require("../contract_abi/Goalfi.json");

// Load environment variables from .env file.
dotenv.config();

function getContractInstance() {
    // Connect to the network using a web socket.
    const provider = new ethers.WebSocketProvider(process.env.FUJI_WS);
    
    // Create a wallet instance.
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Address of the deployed contract.
    const contractAddress = process.env.FIJI_GOALFI_CONTRACT_ADDRESS;

    // ABI of the deployed contract.
    const contractABI = abi.abi;

    // Create a contract instance.
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    return contract;
}

module.exports = { getContractInstance };