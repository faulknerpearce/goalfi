import React, { useEffect } from 'react';

const About = () => {
  // Function to fetch the authorization URL from your backend
  const handleRedirect = async () => {
    try {
      // Call your API endpoint to get the authorization URL
      const response = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/geToken/Request', {
        method: 'GET',
      });

      const data = await response.json();
      console.log('Authorization URL:', data.authUrl);

      // Redirect the user to Strava authorization URL
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error fetching authorization URL:', error);
    }
  };

  useEffect(() => {
    // Capture and log the full URL after redirect
    const currentUrl = window.location.href; // Get the full current URL
    console.log('Redirected URL:', currentUrl);

    // Capture the authorization code from the URL after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code'); // Extract the 'code' from the URL

    if (authCode) {
      console.log('Authorization Code:', authCode);
    } else {
      console.log('Authorization code not found.');
    }
  }, []);

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button onClick={handleRedirect}>
        Connect with Strava
      </button>
    </div>
  );
};

export default About;
