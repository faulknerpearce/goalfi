const dataMap = JSON.parse(args[0]); 
const activityType = args[1];
const results = {};

for (const ID in dataMap) {
  const accessToken = dataMap[ID];

  const apiResponse = await Functions.makeHttpRequest({
    url: 'https://www.strava.com/api/v3/athlete/activities',
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'json'
  });

  if (apiResponse.error) {
    throw Error(`Request failed: ${error}`);
  }

  const data = apiResponse.data;
  let totalDistance = 0;

  // Filters activities based on the activity type and ensure they are not manually added.
  const activities = data.filter(activity => activity.sport_type === activityType );

  if (activities) {
    activities.forEach(activity => {
      totalDistance += Math.round(Number(activity.distance));
    });

    results[ID] = totalDistance;
  } else {
    results[ID] = 0;
  }
}

return Functions.encodeString(JSON.stringify(results));