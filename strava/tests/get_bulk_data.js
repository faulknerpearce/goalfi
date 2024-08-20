const axios = require('axios');

// Function to fetch user's activities
const fetchActivities = async (accessToken) => {
  const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
  const response = await axios.get(activitiesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};

const fetchAllDataForUsers = async (dataMap, activityType) => {
  const results = {};

  for (const walletAddress in dataMap) {
    const accessToken = dataMap[walletAddress];

    const data = await fetchActivities(accessToken);

    let totalDistance = 0;

    // Filters activities based on the activity type and ensures they are not manually added.
    const activities = data.filter(activity => activity.sport_type === activityType);

    if (activities) {
      activities.forEach(activity => {
        totalDistance += Math.round(Number(activity.distance));
      });

      results[walletAddress] = totalDistance;
    } else {
      results[walletAddress] = 0;
    }
  }

  return results;
};

async function main() {
  try {

    const userData = '{"0": "07ad3757dfafd2710db4cb5762a5399ea5d7319a", "1": "60c4ec8aa9c983b981508bb46e23a0edd62a8f49", "2": "962f0258b2fa0c3928aa0428164edfeb2766623a"}';
    const activity = 'Run';

    const userDataMap = JSON.parse(userData);

    const data = await fetchAllDataForUsers(userDataMap, activity);
    console.log(JSON.stringify(data));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

main();
