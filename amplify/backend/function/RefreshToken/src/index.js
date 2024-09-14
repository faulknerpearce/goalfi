const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const axios = require('axios');

// Initialize DynamoDB and Secrets Manager Clients
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  const walletAddress = event.queryStringParameters?.walletAddress;

  if (!walletAddress) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS for all origins
        'Access-Control-Allow-Headers': '*', // Optional: Enable all headers
      },
      body: JSON.stringify({ error: 'walletAddress is required' }),
    };
  }

  // Fetch secrets from Secrets Manager
  let stravaClientId, stravaClientSecret;
  try {
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
    stravaClientId = parsedStravaID.STRAVA_ID;
    stravaClientSecret = parsedStravaSecret.STRAVA_SECRET;
  } catch (secretError) {
    console.error('Error fetching secrets from Secrets Manager:', secretError.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS
        'Access-Control-Allow-Headers': '*', // Optional: Enable all headers
      },
      body: JSON.stringify({ error: 'Error fetching secrets from Secrets Manager' }),
    };
  }

  const getParams = {
    TableName: 'Users-dev',  // Ensure this matches your DynamoDB table name
    Key: {
      walletAddress: { S: walletAddress },  // Use the primary key of your DynamoDB table
    },
  };

  try {
    // Query DynamoDB for the item
    const result = await dynamoDBClient.send(new GetItemCommand(getParams));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*', // Enable CORS
        },
        body: JSON.stringify({ error: 'Item not found' }),
      };
    }

    // Convert the result to a more readable format
    const userId = result.Item.Id.S;
    let accessToken = result.Item.AccessToken.S;
    const refreshToken = result.Item.RefreshToken.S;
    let expiresAt = parseInt(result.Item.expiresAt.N);

    // Check if the access token is expired
    if (Date.now() > expiresAt * 1000) { // Token expired, refresh it
      console.log('Access token expired. Refreshing token...');
      try {
        // Refresh token via Strava API
        const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
          client_id: stravaClientId,
          client_secret: stravaClientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });

        accessToken = response.data.access_token;
        expiresAt = response.data.expires_at;

        // Update DynamoDB with the new tokens
        const updateParams = {
          TableName: 'Users-dev',
          Key: { walletAddress: { S: walletAddress } },
          UpdateExpression: 'SET AccessToken = :accessToken, expiresAt = :expiresAt, RefreshToken = :refreshToken',
          ExpressionAttributeValues: {
            ':accessToken': { S: accessToken },
            ':expiresAt': { N: expiresAt.toString() }, // Store in seconds
            ':refreshToken': { S: response.data.refresh_token },
          },
        };
        await dynamoDBClient.send(new UpdateItemCommand(updateParams));

        console.log('Token refreshed and updated in the database.');
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError.message);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*', // Enable CORS
          },
          body: JSON.stringify({ error: 'Error refreshing token' }),
        };
      }
    }

    // Return the userId and accessToken
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS
      },
      body: JSON.stringify({
        userId,
        accessToken,
      }),
    };

  } catch (error) {
    console.error('Error reading from DynamoDB or refreshing token:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};