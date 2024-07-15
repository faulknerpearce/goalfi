const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  const walletPrivateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.STRAVA_CONTRACT_ADDRESS;
  const sepoliaUrl = process.env.SEPOLIA_URL;

  const provider = new ethers.JsonRpcProvider(sepoliaUrl);
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const contractABI = [
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
    }
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  async function getActivityData() {
    try {
      console.log("Fetching last activity data");
      const activityData = await contract.getLastActivity();
      const activityDataStr = {
        activityType: activityData.activityType,
        activityData: activityData.activityData
      };
      console.log(`Activity Data: ${JSON.stringify(activityDataStr)}`);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  }

  await getActivityData();
}

main().catch(console.error);
