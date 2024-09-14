const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const axios = require('axios');

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

exports.handler = async (event) => {

  const body = JSON.parse(event.body);
  const { Code } = body; 
  if (!Code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields in request' }),
    };
  }

  try {
    // Fetch STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET from AWS Secrets Manager
    const responseStravaID = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: 'STRAVA_ID',
        VersionStage: 'AWSCURRENT',
      })
    );

    const responseStravaSecret = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: 'STRAVA_SECRET',
        VersionStage: 'AWSCURRENT',
      })
    );

    // Parse the secrets
    const parsedStravaID = JSON.parse(responseStravaID.SecretString);
    const parsedStravaSecret = JSON.parse(responseStravaSecret.SecretString);

    // Extract the values of STRAVA_ID and STRAVA_SECRET
    const stravaClientId = parsedStravaID.STRAVA_ID;
    const stravaClientSecret = parsedStravaSecret.STRAVA_SECRET;

    // Exchange the authorization code for access and refresh tokens from Strava
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      code: Code,
      grant_type: 'authorization_code',
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ data: tokenResponse.data }),
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
