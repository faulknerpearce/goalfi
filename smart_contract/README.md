# Chainlink Functions with Strava Integration

## Overview
This project demonstrates how to use Chainlink Functions to interact with the Strava API. It allows you to fetch activity data from Strava through a decentralized oracle network.

## Prerequisites
- A Chainlink Functions subscription
- A Strava API application
- Avalanche fuji testnet AVAX
- Metamask or another web3 wallet
- Node.js (v16 or later)
- npm or yarn

## Setup Chainlink Functions

### 1. Create a Chainlink Subscription
1. Visit [Chainlink Functions](https://functions.chain.link/)
2. Connect your wallet
3. Click "Create New Subscription" 
4. Fund your subscription with LINK tokens
5. Save your subscription ID
6. Make sure the subscription ID, DonID and Router matches the chain you wish to deploy on.

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Wallet 
PRIVATE_KEY = 'YOUR_PRIVATE_KEY'

# Rpc url
FUJI_URL = 'YOUR_AVALANCE_FUJI_RPC_URL'

# Chainlink 
FUJI_SUBSCRIPTION_ID = 'YOUR_SUBSCRIPTION_ID'

# Contract 
STRAVA_CONTRACT_ADDRESS_FUJI = 'YOUR_CONTRACT_ADDRESS' 

# Strava
CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"

ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'
```

### 3. Smart Contract Configuration
1. Locate the consumer contract in `contracts/`
2. Update the following parameters:
   - DON ID (from Chainlink Functions UI)
   - Router Address (from Chainlink Functions UI)
   - Subscription ID (from your `.env` file)

### 4. Source Code Configuration
1. Review `scripts/source.js`
2. This JavaScript code will be executed by Chainlink nodes
3. Modify the API query parameters as needed
4. Test the source code locally before deployment

### 5. Deploy the Contract
```bash
# Install dependencies
npm install

# Deploy to Avalanche testnet
npx hardhat run scripts/deploy.js --network fuji
```

### 5.2 After deployment:
1. Navigate to artifacts/contracts/StravaFunctions.sol/StravaFunctions.json
2. Copy the entire JSON file
3. Paste it into the JSON file in the contract_abi folder.

### 6. Add Consumer to Subscription
1. Copy the deployed contract address
2. Go to [Chainlink Functions](https://functions.chain.link/)
3. Find your subscription
4. Click "Add Consumer"
5. Paste the contract address
6. Confirm the transaction

## Strava Integration

### 1. Create Strava API Application
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Click "Create Application"
3. Fill in required details:
   - Application Name
   - Website
   - Description
   - Authorization Callback Domain

### 2. Configure Strava API Credentials
Add to your `.env` file:
```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:5173/callback
```

### 3. Frontend Configuration (if using Vite)
1. Set up the redirect URI in your Strava application settings
2. Default Vite port is 5173
3. Update the callback route in your frontend application

## Testing

```bash
# Run local hardhat network
npx hardhat node

# Run tests
npx hardhat test

# Test specific file
npx hardhat test test/YourTest.js
```

## Common Issues

### Subscription Issues
- Ensure sufficient LINK balance
- Verify consumer contract is authorized
- Check subscription is active

### Strava API Issues
- Confirm API credentials are correct
- Verify redirect URI matches exactly
- Check API rate limits

## Resources
- [Chainlink Functions Documentation](https://docs.chain.link/chainlink-functions)
- [Strava API Documentation](https://developers.strava.com/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)

## License
MIT