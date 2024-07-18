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
const activity = data.find(activity => activity.sport_type === activityType);
if (activity) {
  const distance = Math.round(Number(activity.distance));
  return Functions.encodeUint256(distance);
} else {
  return Functions.encodeString(`No activities found for type: ${activityType}.`);
}