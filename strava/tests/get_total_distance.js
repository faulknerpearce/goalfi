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

async function get_total_distance(activity_type, accessToken) {
  let totalDistance = 0;

  const data = await fetchActivities(accessToken);

  // Filter activities based on the activity type and ensure they are not manually added
  const activities = data.filter(activity => activity.sport_type === activity_type && !activity.manual);

  // Calculate the total distance
  activities.forEach(activity => {
    const timestamp = DateTime.fromISO(activity.start_date, { zone: 'utc' }).toSeconds();
    totalDistance += Math.round(activity.distance);
  });

  console.log(`Total Distance for Activity, ${activity_type}: ${totalDistance} meters`);
}

(async () => {
  try {
    const accessToken = process.env.ACCESS_TOKEN;
    const activity_type = 'Ride';

    await get_total_distance(activity_type, accessToken);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})();
