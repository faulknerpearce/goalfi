const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to retrieve or refresh an access token for a given wallet address.
const getToken = async (walletAddress) => {
  try {
    // Define the path to the users data file.
    const usersDir = path.resolve(__dirname, 'users');
    const filePath = path.join(usersDir, 'users.json');

    // Check if the user data file exists.
    if (!fs.existsSync(filePath)) {
      console.error('User data file not found');
      throw new Error('User data file not found');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const Address = walletAddress.toLowerCase();
    const userData = data[Address];

    // If user data is not found, throw an error
    if (!userData) {
      console.error(`User not found for wallet address: ${walletAddress}`);
      throw new Error('User not found');
    }
    console.log(`Fetched the user's access token for the wallet address: ${Address}`);

    const { 'ID': userId, 'Access Token': accessToken, 'Refresh Token': refreshToken, 'Expires At': expiresAt } = userData;

    // Check if the access token is still valid
    if (Date.now() < expiresAt) {
      return { userId, accessToken };
    }

    // If the access token has expired, refresh it.
    try {
      const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      userData['Access Token'] = response.data.access_token;
      userData['Refresh Token'] = response.data.refresh_token;
      userData['Expires At'] = Date.now() + (response.data.expires_in * 1000);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Refreshed tokens for ${walletAddress}`);
      return { userId, accessToken: response.data.access_token };
    } catch (refreshError) {
      console.error('Error refreshing token:', refreshError.message);
      throw refreshError;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = getToken;
