const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

// Function to refresh access token
const refreshAccessToken = async () => {
  const tokenUrl = 'https://www.strava.com/api/v3/oauth/token';
  const response = await axios.post(tokenUrl, null, {
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }
  });
  return response.data;
};

const main = async () => {
  try {
    const tokenData = await refreshAccessToken();
    console.log(`New Access Token: ${tokenData.access_token}`);
  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
  }
};

main();
