import React, { useContext } from 'react';
import { TransactionContext } from '../context/TransactionContext';

const About = () => {
  const { fetchAddressesAndTokens } = useContext(TransactionContext);

  const handlefetchAddressesAndTokens = async () => {
    const goalId = 0; // Replace with the  goal ID you want to fetch.
    const data = await fetchAddressesAndTokens(goalId);
    console.log('Participant Tokens:', data);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl text-white">About</h1>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        onClick={handlefetchAddressesAndTokens}
      >
        Fetch Participant Tokens
      </button>
    </div>
  );
};

export default About;