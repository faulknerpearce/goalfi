import React, { useContext } from 'react';
import { TransactionContext } from "../context/TransactionContext";

const About = () => {
  const { currentAccount, fetchToken, fetchParticipantsTokens} = useContext(TransactionContext);

  const handleGetToken = async () => {
    try {
      const tokens = await fetchToken(currentAccount); 
      console.log('Fetched tokens:', tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const handlefetchAllTokens = async () => {
    try {
      const tokens = await fetchParticipantsTokens(11);
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
        Fetch Token (Don't Fucking Press it)
      </button>
      <button 
        className="text-white bg-blue-700 rounded-full px-4 py-2" 
        onClick={handlefetchAllTokens}
      >
        Fetch Participants Tokens (Don't Fucking Press this one either)
      </button>
    </div>
  );
};

export default About;
