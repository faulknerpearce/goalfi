const { ethers } = require("ethers");
const abi = require("../contract_abi/StravaConsumer.json");
const dotenv = require("dotenv");


dotenv.config();

async function requestActivityData(AccsessToken, activityType) {
  const walletPrivateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.STRAVA_CONTRACT_ADDRESS;
  const sepoliaUrl = process.env.SEPOLIA_URL;

  const provider = new ethers.JsonRpcProvider(sepoliaUrl);
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const contractABI = abi.abi;

  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  console.log(`Requesting activity data for sport type: ${activityType}` );

  const tx = await contract.getStravaActivity(AccsessToken, activityType);
  
  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

const activityType = 'Run';
const AccsessToken = process.env.ACCESS_TOKEN;

requestActivityData(AccsessToken, activityType).catch(console.error);
