const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  const walletAddress = event.queryStringParameters?.walletAddress;  // Assuming the walletAddress is passed as a query parameter

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

  const getParams = {
    TableName: 'Users-dev',  // Update with your DynamoDB table name
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
          'Access-Control-Allow-Headers': '*', // Optional: Enable all headers
        },
        body: JSON.stringify({ error: 'Item not found' }),
      };
    }

    // Convert the result to a more readable format
    const retrievedData = {
      userId: result.Item.Id.S,
      accessToken: result.Item.AccessToken.S,
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS
        'Access-Control-Allow-Headers': '*', // Optional: Enable all headers
      },
      body: JSON.stringify(retrievedData),
    };

  } catch (error) {
    console.error('Error reading from DynamoDB:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Enable CORS
        'Access-Control-Allow-Headers': '*', // Optional: Enable all headers
      },
      body: JSON.stringify({ error: 'Error reading from DynamoDB' }),
    };
  }
};
