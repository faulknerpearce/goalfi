const axios = require('axios');
const dotenv = require('dotenv');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');
const readlineSync = require('readline-sync');

// Load environment variables
dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
  const tokenUrl = 'https://www.strava.com/api/v3/oauth/token';
  const response = await axios.post(tokenUrl, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });
  return response.data;
};

// Function to fetch user's activities
const fetchActivities = async (accessToken) => {
  const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
  const response = await axios.get(activitiesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};

// Function to load user data from JSON file
const loadUserData = (walletAddress) => {
  const filePath = path.resolve(__dirname, 'users', `${walletAddress}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } else {
    throw new Error(`User data for wallet address ${walletAddress} not found.`);
  }
};

const main = async () => {
  try {
    const walletAddress = readlineSync.question('Enter your wallet address: ');
    let userData = loadUserData(walletAddress);

    // Check if the access token is expired and refresh if needed
    if (DateTime.now().plus({ seconds: -60 }).toSeconds() >= userData.expires_in) {
      const newTokenData = await refreshAccessToken(userData.refresh_token);
      userData.access_token = newTokenData.access_token;
      userData.refresh_token = newTokenData.refresh_token;
      userData.expires_in = newTokenData.expires_in;
      fs.writeFileSync(`./users/${walletAddress}.json`, JSON.stringify(userData, null, 2));
    }

    // Fetch user's activities
    const activities = await fetchActivities(userData.access_token);

    // Print the details of all activities
    activities.forEach(activity => {
      const startDate = DateTime.fromISO(activity.start_date, { zone: 'utc' }).toSeconds();
      console.log(`\nStart Timestamp: ${Math.round(startDate)}`);
      console.log(`Sport Type: ${activity.sport_type}`);
      console.log(`Distance: ${Math.round(activity.distance)} meters`);
      console.log(`Manual: ${activity.manual}`)
    });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

main();
