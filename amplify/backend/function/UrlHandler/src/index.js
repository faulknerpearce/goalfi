const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

// Create the Secrets Manager client
const client = new SecretsManagerClient({
  region: "us-east-1", 
});

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  
  const secrets = {};

  try {
    // Fetch STRAVA_ID from AWS Secrets Manager
    const responseStravaID = await client.send(
      new GetSecretValueCommand({
        SecretId: "STRAVA_ID",
        VersionStage: "AWSCURRENT",
      })
    );

    // Parse the escaped JSON string for STRAVA_ID
    const parsedSecret = JSON.parse(responseStravaID.SecretString.replace(/\\"/g, '"')); 
    secrets.stravaID = parsedSecret.STRAVA_ID

    // Generate the Strava authorization URL
    const state = Math.random().toString(36).substring(7);
    const redirectUri = 'https://main.d1cptuxq4eyvc4.amplifyapp.com';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${secrets.stravaID}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=auto&scope=read_all,activity:read_all&state=${state}`;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ authUrl }),
    };

  } catch (error) {
    console.error("Error fetching secrets or generating auth URL:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
