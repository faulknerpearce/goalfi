import React, { useEffect, useContext, useState } from 'react';
import { TransactionContext } from "../context/TransactionContext";

const About = () => {
  const { currentAccount, getUserId } = useContext(TransactionContext);
  const [authCode, setAuthCode] = useState(null); // State to store the authorization code
  const [isCodeFetched, setIsCodeFetched] = useState(false); // State to track if code has been fetched

  const handleRedirect = async () => {
    try {
      const response = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/GetUrl', {
        method: 'GET',
      });

      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error fetching authorization URL:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCodeFromUrl = urlParams.get('code'); 

      if (authCodeFromUrl && currentAccount && !isCodeFetched) {
        try {
          const userId = await getUserId(currentAccount);
          setAuthCode(authCodeFromUrl); // Save the authorization code to state
          setIsCodeFetched(true); // Mark that code has been fetched to prevent re-fetching

          console.log(`Wallet Address: ${currentAccount}`);
          console.log(`User ID: ${userId}`);
          console.log('Authorization Code:', authCodeFromUrl);
  
          // Call RequestToken API
          const RequestTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/RequestToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Code: authCodeFromUrl
            }),
          });

          // Parse and log the response
          const responseData = await RequestTokenResponse.json();

          if (RequestTokenResponse.ok) {
            // Access the data correctly
            const { access_token, refresh_token, expires_at } = responseData.data;

            console.log('Access Token:', access_token);
            console.log('Refresh Token:', refresh_token);
            console.log('Expires At:', expires_at);

            // Save the tokens and other details to DynamoDB using the Lambda function
            const saveTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/SaveToken', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                walletAddress: currentAccount,
                Id: userId,  
                stravaAccessToken: access_token,
                stravaRefreshToken: refresh_token,
                expiresAt: expires_at,
              }),
            });

            const saveResponseData = await saveTokenResponse.json();
            if (saveTokenResponse.ok) {
              console.log('Successfully saved to DynamoDB:', saveResponseData);
            } else {
              console.error('Error saving to DynamoDB:', saveResponseData);
            }
            
          } else {
            console.error('Error response from RequestToken API:', responseData);
          }

        } catch (error) {
          console.error('Error saving token:', error);
        }
      } 
    };

    if (!isCodeFetched) {
      fetchData(); // Call the async function only if the code hasn't been fetched yet
    }
  }, [currentAccount, getUserId, isCodeFetched]);

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button onClick={handleRedirect}>
        Connect with Strava
      </button>
    </div>
  );
};

export default About;
