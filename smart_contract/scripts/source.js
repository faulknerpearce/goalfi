const accessTokens = JSON.parse(args[0]); 
const activityType = args[1];
const startTimestamp = Number(args[2]); 
const expiryTimestamp = Number(args[3]);

const results = [];

for (const userID in accessTokens) {
  const accessToken = accessTokens[userID];

  const apiResponse = await Functions.makeHttpRequest({
    url: 'https://www.strava.com/api/v3/athlete/activities',
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'json'
  });

  if (apiResponse.error) {
    throw new Error('Request failed.');
  }

  const data = apiResponse.data;
  let totalDistance = 0;

  const activities = data.filter(activity => activity.sport_type === activityType && !activity.manual);

  if (activities) {
    activities.forEach(activity => {

      const startDate = new Date(activity.start_date).getTime() / 1000;

      if (startDate >= startTimestamp && startDate <= expiryTimestamp) {
        totalDistance += Math.round(Number(activity.distance)); 
      }
    });
    results.push(Number(userID));
    results.push(totalDistance);
  } else {
    results.push(Number(userID));
    results.push(0);
  }
}

return Functions.encodeString(JSON.stringify(results));
