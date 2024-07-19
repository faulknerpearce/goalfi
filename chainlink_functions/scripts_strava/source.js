const accessToken = args[0];
const activityType = args[1];
const apiResponse = await Functions.makeHttpRequest({
  url: 'https://www.strava.com/api/v3/athlete/activities',
  headers: { Authorization: `Bearer ${accessToken}` },
  responseType: 'json'
});
if (apiResponse.error) {
  throw Error('Request failed');
}
const data = apiResponse.data;

let totalDistance = 0;

// Filters activities based on the activity type and ensure they are not manually added.
const activities = data.filter(activity => activity.sport_type === activityType && !activity.manual);

if (activities) {
    activities.forEach(activity => {
        totalDistance += Math.round(Number(activity.distance));
    });
  
    return Functions.encodeUint256(totalDistance);
} else {
    return Functions.encodeString(`No activities found for type: ${activityType}.`);
}
