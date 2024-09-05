import React from 'react';

const About = () => {
  // Function to handle button click
  const handleRedirect = async () => {
    try {
      // Call your API endpoint
      const response = await fetch('https://05l1eze4mf.execute-api.us-east-1.amazonaws.com/dev/addresses/success', {
        method: 'GET',
      });
      console.log(response)

    } catch (error) {
      console.error('Error fetching redirect:', error);
    }
  };

  return (
    <div className="p-4">
      <button onClick={handleRedirect}>
        Test Api
      </button>
    </div>
  );
};

export default About;
