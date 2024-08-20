const axios = require('axios');
const { DateTime } = require('luxon');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Function to fetch user's activities
const fetchActivities = async (accessToken) => {
  const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
  const response = await axios.get(activitiesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};

const main = async () => {
  try {

    const accessToken = process.env.ACCESS_TOKEN;
    
    // Fetch user's activities
    const activities = await fetchActivities(accessToken);

    // Find the first activity that is a run
    const runActivity = activities.find(activity => activity.sport_type === 'Run');

    if (runActivity) {
      const startDate = DateTime.fromISO(runActivity.start_date, { zone: 'utc' }).toSeconds();
      console.log(`\nStart Timestamp: ${Math.round(startDate)}`);
      console.log(`Sport Type: ${runActivity.sport_type}`);
      console.log(`Distance: ${Math.round(runActivity.distance)} meters`);
    } else {
      console.log('No running activities found.');
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

main();
