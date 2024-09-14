const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  // Parse the request body
  const body = JSON.parse(event.body);
  const { walletAddress, Id, stravaAccessToken, stravaRefreshToken, expiresAt } = body;

  // Validate required fields
  if (!walletAddress || !stravaAccessToken || !stravaRefreshToken || !expiresAt) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',  // CORS header
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({ error: 'Missing required fields in request' }),
    };
  }

  // Prepare the DynamoDB parameters
  const params = {
    TableName: 'Users-dev',  // DynamoDB table name
    Item: {
      walletAddress: { S: walletAddress }, 
      Id: { S: Id.toString() }, 
      AccessToken: { S: stravaAccessToken }, 
      RefreshToken: { S: stravaRefreshToken }, 
      expiresAt: { N: expiresAt.toString() }, 
    },
  };

  try {
    // Store the data in DynamoDB
    await dynamoDBClient.send(new PutItemCommand(params));

    // Return a successful response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  // CORS header
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({ message: 'Data stored successfully.' }),
    };
  } catch (error) {
    console.error('Error storing data in DynamoDB:', error);

    // Return an error response with CORS headers
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',  // CORS header
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({ error: 'Error storing data.' }),
    };
  }
};
