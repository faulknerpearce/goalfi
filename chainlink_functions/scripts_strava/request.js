const { ethers } = require("ethers");
const abi = require("../contract_abi/Goalfi.json");
const dotenv = require("dotenv");

dotenv.config();

async function requestActivityData(AccsessToken, activityType, walletAddress, goalId) {
  
  const walletPrivateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.STRAVA_CONTRACT_ADDRESS_FUJI; // Fuji Network.
  const fujiUrl = process.env.FUJI_URL; // Fuji Network.

  const provider = new ethers.JsonRpcProvider(fujiUrl);
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const contractABI = abi.abi; 
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  console.log(`Requesting activity data for sport type: ${activityType}` );

  const tx = await contract.executeRequest(AccsessToken, activityType, walletAddress, goalId);
  
  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

const AccsessToken = process.env.ACCESS_TOKEN;
const activityType = 'Run'; // Hardcoded for testing.
const walletAddress = '0x96af4089a5bE5e29efB631Fee00FF0b1005985BB';// Hardcoded for testing.
const goalId = '0';// Hardcoded for testing.

requestActivityData(AccsessToken, activityType, walletAddress, goalId).catch(console.error);
