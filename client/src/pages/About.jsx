import React from 'react';

const About = () => {
  // Function to handle button click
  const handleRedirect = async () => {
    try {
      // Call your API endpoint
      const response = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/geToken/Request', {
        method: 'GET',
      });
      
      const responseData = await response.json();
      
      // Assuming the API response contains the redirect URL in a field called `authUrl`
      const redirectUrl = responseData.authUrl;

      // Redirect the browser to the new URL
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('Error fetching redirect:', error);
    }
  };

  return (
    <div className="text-white px-10 py-3 rounded-full bg-blue-700">
      <button onClick={handleRedirect}>
        Test Api
      </button>
    </div>
  );
};

export default About;
