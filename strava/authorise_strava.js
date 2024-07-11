const axios = require('axios');
const dotenv = require('dotenv');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUrl = process.env.REDIRECT_URL;

// Function to generate authorization URL
const generateAuthUrl = () => {
  const authBaseUrl = 'https://www.strava.com/oauth/authorize';
  const scope = 'read_all,activity:read_all';
  const state = Math.random().toString(36).substring(7);
  return `${authBaseUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&approval_prompt=auto&scope=${scope}&state=${state}`;
};

// Function to fetch access token
const fetchToken = async (authorizationCode) => {
  const tokenUrl = 'https://www.strava.com/api/v3/oauth/token';
  const response = await axios.post(tokenUrl, {
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    grant_type: 'authorization_code'
  });
  return response.data;
};

// Function to save user data to a JSON file
const saveUserData = (walletAddress, tokenData) => {
  const usersDir = path.resolve(__dirname, 'users');
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir);
  }

  const filePath = path.join(usersDir, `${walletAddress}.json`);
  const data = {
    wallet_address: walletAddress,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const main = async () => {
  try {
    // Generate authorization URL
    const authLink = generateAuthUrl();
    console.log(`\nClick Here:\n${authLink}`);

    // Get the authorization response URL from the user
    const redirectResponse = readlineSync.question('\nPaste the full redirect URL here: ');
    const walletAddress = readlineSync.question('Enter your wallet address: ');

    // Extract the authorization code from the redirect response
    const urlParams = new URLSearchParams(new URL(redirectResponse).search);
    const authorizationCode = urlParams.get('code');

    // Fetch access token
    const tokenData = await fetchToken(authorizationCode);

    // Save user data to JSON file
    saveUserData(walletAddress, tokenData);
    console.log(`User data saved for wallet address: ${walletAddress}`);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

main();
