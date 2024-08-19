const dataList = JSON.parse(args[0]); 
const activityType = args[1];
const results = [];

for (const userID in dataList) {
  const accessToken = dataList[userID];

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
      totalDistance += Math.round(Number(activity.distance));
    });
    results.push(Number(userID));
    results.push(totalDistance);
  } else {
    results.push(Number(userID));
    results.push(0);
  }
}

return Functions.encodeString(JSON.stringify(results));
