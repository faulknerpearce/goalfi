import React, { useContext } from 'react';
import { TransactionContext } from "../context/TransactionContext";

const About = () => {
  const { currentAccount, fetchTokenTest } = useContext(TransactionContext);

  const handleGetToken = async () => {
    if (!currentAccount) {
      console.error('No wallet connected');
      return;
    }

    try {
      console.log(currentAccount);
      const tokens = await fetchTokenTest(currentAccount, 11); 
      console.log('Fetched tokens:', tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  return (
    <div className="text-white">
      <button 
        className="text-white bg-blue-700 rounded-full px-4 py-2" 
        onClick={handleGetToken}
      >
        Get Token Test
      </button>
    </div>
  );
};

export default About;
