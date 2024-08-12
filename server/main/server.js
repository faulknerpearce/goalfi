const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const saveUserData = require('./saveUserData');
const getToken = require('./getToken');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Endpoint to generate Strava authorization URL
app.get('/api/generate-auth-url', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URL}&approval_prompt=auto&scope=read_all,activity:read_all&state=${state}`;
  res.json({ authUrl });
});

// Endpoint to handle the Strava OAuth token exchange
app.post('/api/exchange-token', async (req, res) => {
  const { code, walletAddress, userId } = req.body;  // Include userId in the request body

  try {
    // Exchange the authorization code for access and refresh tokens
    const tokenResponse = await axios.post('https://www.strava.com/api/v3/oauth/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    saveUserData(walletAddress, userId, tokenResponse.data);  // Pass userId to saveUserData
    console.log(`User Tokens Saved.`);

    res.status(200).send('Token exchange complete');
  } catch (error) {
    console.error('Error exchanging token:', error.message);
    res.status(500).send('Token exchange failed');
  }
});

// Endpoint to handle token retrieval
app.post('/api/get-token', async (req, res) => {
  const { walletAddress } = req.body;

  try {
    const data = await getToken(walletAddress);
    res.json({ data });
  } catch (error) {
    console.error('Error getting token:', error.message);
    res.status(500).send('Error getting token');
  }
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
