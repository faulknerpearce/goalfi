const axios = require('axios');
const dotenv = require('dotenv');
const readlineSync = require('readline-sync');

// Load environment variables
dotenv.config();

const revokeToken = async (accessToken) => {
  try {
    const response = await axios.post('https://www.strava.com/oauth/deauthorize', null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('Token revoked:', response.data);
  } catch (error) {
    console.error('Error revoking token:', error.response ? error.response.data : error.message);
  }
};

const main = async () => {
  const accessToken = readlineSync.question('Enter the access token to revoke: ');
  await revokeToken(accessToken);
};

main();