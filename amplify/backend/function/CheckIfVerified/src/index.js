const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

exports.handler = async (event) => {

    // Extract walletAddress from query string parameters
    const walletAddress = event.queryStringParameters?.walletAddress;

    if (!walletAddress) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',  // CORS header
            },
            body: JSON.stringify({ error: 'walletAddress is required' }),
        };
    }

    const getParams = {
        TableName: 'Users-dev',  // Ensure this matches your DynamoDB table name
        Key: {
            walletAddress: { S: walletAddress },  // Use the primary key of your DynamoDB table
        },
    };

    try {
        // Query DynamoDB for the wallet address
        const result = await dynamoDBClient.send(new GetItemCommand(getParams));

        // Check if the item exists in the database
        if (result.Item) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',  // CORS header
                },
                body: JSON.stringify({ found: true }),  // Return true if found
            };
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',  // CORS header
                },
                body: JSON.stringify({ found: false }),  // Return false if not found
            };y
        }

    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',  // CORS header
            },
            body: JSON.stringify({ error: 'Error querying DynamoDB' }),
        };
    }
};

