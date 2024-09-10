import React, { useEffect, useContext, useState } from 'react';
import { TransactionContext } from "../context/TransactionContext";

const About = () => {
  const { currentAccount, getUserId } = useContext(TransactionContext);
  const [authCode, setAuthCode] = useState(null);

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
      // Capture the full URL to check if the code is present
      const currentUrl = window.location.href;
      console.log('Redirected URL:', currentUrl);

      // Capture the authorization code from the URL after redirect
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code'); // Extract the 'code' from the URL

      if (code && currentAccount) {
        setAuthCode(code);  // Set authCode state to trigger token exchange

        try {
          const userId = await getUserId(currentAccount); // Fetch the user ID 
          console.log('Authorization Code:', code);

          // POST request to SaveToken API with walletAddress, userId, and authorization code
          const saveTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/SaveToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: currentAccount,  // Send walletAddress
              ID: userId,  // Send userId
              Code: code  // Send authorization code
            }),
          });

          const responseData = await saveTokenResponse.json();

          // Log the response from the backend API
          if (saveTokenResponse.ok) {
            console.log('Response from SaveToken API:', responseData);
          } else {
            console.error('Error response from SaveToken API:', responseData);
          }

        } catch (error) {
          console.error('Error saving token:', error);
        }
      } else if (!code) {
        console.log('Authorization code not found in URL.');
      }
    };

    fetchData(); // Call the async function
  }, [currentAccount, getUserId, authCode]);

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button onClick={handleRedirect}>
        Connect with Strava
      </button>
    </div>
  );
};

export default About;
