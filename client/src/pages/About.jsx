import React, { useContext } from 'react';
import { TransactionContext } from '../context/TransactionContext';

const About = () => {
  const { requestData } = useContext(TransactionContext);

  const handleRequest = async () => {
    const goalId = 0; // Replace with the goal ID you want to fetch.
    const activity = 'Walk'; // Replace with the activity you want to fetch

  };

  return (
    <div className="p-4">
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-full mt-4"
        onClick={handleRequest}
      >
        Request Data
      </button>
    </div>
    
  );
};

export default About;