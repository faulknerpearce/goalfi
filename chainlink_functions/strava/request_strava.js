const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

async function requestActivityData(AccsessToken, activityType) {
  const walletPrivateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.STRAVA_CONTRACT_ADDRESS;
  const sepoliaUrl = process.env.SEPOLIA_URL;

  const provider = new ethers.JsonRpcProvider(sepoliaUrl);
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "accessToken",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "activityType",
          "type": "string"
        }
      ],
      "name": "getStravaActivity",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLastActivity",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "activityType",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "activityData",
              "type": "string"
            }
          ],
          "internalType": "struct StravaConsumer.ActivityStruct",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "functionsSubscriptionId",
          "type": "uint64"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    }
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  console.log(`Requesting activity data for sport type: ${activityType}` );

  const tx = await contract.getStravaActivity(AccsessToken, activityType);
  
  console.log(`Activity data request sent for ${activityType}, transaction hash: ${tx.hash}`);
}

const activityType = 'Run';
const AccsessToken = process.env.ACCESS_TOKEN;

requestActivityData(AccsessToken, activityType).catch(console.error);
