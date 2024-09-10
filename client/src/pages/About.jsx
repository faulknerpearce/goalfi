import React, { useEffect, useContext } from 'react';
import { TransactionContext } from "../context/TransactionContext";

const About = () => {
  const { currentAccount, getUserId } = useContext(TransactionContext);

  // Function to fetch the authorization URL from your backend
  const handleRedirect = async () => {
    try {
      // Call your API endpoint to get the authorization URL
      const response = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/GetUrl', {
        method: 'GET',
      });

      const data = await response.json();

      // Redirect the user to Strava authorization URL
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error fetching authorization URL:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Capture the authorization code from the URL after redirect
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code'); 

      if (authCode && currentAccount) {
        try {
          const userId = await getUserId(currentAccount); // Fetch the user ID 

          console.log(`Wallet Address: ${currentAccount}`)
          console.log(`User ID: ${userId}`)
          console.log('Authorization Code:', authCode);
  
          // Call RequestToken API
          const RequestTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/RequestToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Code: authCode
            }),
          });

          // Parse and log the response
          const responseData = await RequestTokenResponse.json();

          if (RequestTokenResponse.ok) {
            console.log('Response from RequestToken API:', responseData);
            console.log('Access Token:', responseData.access_token);
            console.log('Refresh Token:', responseData.refresh_token);
            console.log('Expires At:', responseData.expires_at);
            
          } else {
            console.error('Error response from RequestToken API:', responseData);
          }

        } catch (error) {
          console.error('Error saving token:', error);
        }
      } else {
        console.log('Authorization code not found or wallet address missing.');
      }
    };

    fetchData(); // Call the async function
  }, [currentAccount, getUserId]);

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button onClick={handleRedirect}>
        Connect with Strava
      </button>
    </div>
  );
};

export default About;
