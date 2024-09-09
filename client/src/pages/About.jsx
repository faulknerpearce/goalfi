import React, { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    // Extract the authorization code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode) {
      exchangeCodeForTokens(authCode);
    }
  }, []);

  // Function to exchange authorization code for tokens
  const exchangeCodeForTokens = async (code) => {
    try {
      const response = await fetch('https://your-api-endpoint-to-exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log('Tokens:', data);

      // Now you have access_token and refresh_token to store and use
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
    }
  };

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button>
        Approving via Strava...
      </button>
    </div>
  );
};

export default About;
