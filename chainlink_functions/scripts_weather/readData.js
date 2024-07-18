const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  const walletPrivateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.WEATHER_CONTRACT_ADDRESS;

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        }
      ],
      "name": "getCity",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "temperature",
              "type": "string"
            }
          ],
          "internalType": "struct WeatherConsumer.CityStruct",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  async function getCityData(city) {
    try {
      console.log(`fetching weather for ${city}`)
      const cityData = await contract.getCity(city);
     
      const cityDataObject = {
        temperature: cityData.temperature.replace(/\n/g, "")
      };

      console.log(`City Data: ${JSON.stringify(cityDataObject)}`);
    } catch (error) {
      console.error("Error fetching city data:", error);
    }
  }

  const city = "Perth"; // Replace with your city
  await getCityData(city);
}
  
main().catch(console.error);
