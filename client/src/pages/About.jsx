import React, { useEffect, useContext, useState } from 'react';
import { TransactionContext } from "../context/TransactionContext";

const About = () => {
  const { currentAccount, getUserId } = useContext(TransactionContext);
  const [hasFetched, setHasFetched] = useState(false); // Add a flag to track whether fetch has already been called

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
    if (hasFetched) return;

    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');

      if (authCode && currentAccount) {
        try {
          const userId = await getUserId(currentAccount);
          
          console.log(`Wallet Address: ${currentAccount}`);
          console.log(`User ID: ${userId}`);
          console.log('Authorization Code:', authCode);

          const RequestTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/RequestToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Code: authCode,
            }),
          });

          const responseData = await RequestTokenResponse.json();

          if (RequestTokenResponse.ok) {
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
      setHasFetched(true); // Set the flag to true to prevent future execution
    };

    fetchData(); 
  }, [currentAccount, getUserId, hasFetched]);

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button onClick={handleRedirect}>
        Connect with Strava
      </button>
    </div>
  );
};

export default About;
