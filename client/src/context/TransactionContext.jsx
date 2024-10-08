import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

export const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [isStravaAuthorized, setIsStravaAuthorized] = useState(false);
  const [loading, setLoading] = useState(false); 

  // Checks if a user exists in the smart contract for the given address.
  const checkUserExists = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const addressUsed = await contract.userAddressUsed(address);

      console.log(`checkUserExists: address used: ${addressUsed}`);

      return addressUsed;
    } catch (error) {
      console.error("checkUserExists: Error checking user existence: ", error);
      return false;
    }
  };

  // Checks if the wallet is connected and updates the state accordingly.
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {

        setCurrentAccount(accounts[0]);
        const userExists = await checkUserExists(accounts[0]);
        const stravaAuthorized = await checkStravaAuthorization(accounts[0]);
        
        setIsUserCreated(userExists);
        setIsStravaAuthorized(stravaAuthorized);

      } else {
        console.log("checkIfWalletIsConnected: No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("checkIfWalletIsConnected: No ethereum object");
    }
  };

  // Connects the user's wallet using MetaMask and updates the state.
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("connectWallet: Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      const userExists = await checkUserExists(accounts[0]);
      const stravaAuthorized = await checkStravaAuthorization(accounts[0]);

      console.log(`connectWallet: User exists for ${accounts[0]}:`, userExists);

      setIsUserCreated(userExists);
      setIsStravaAuthorized(stravaAuthorized);
    } catch (error) {
      console.log(error);
      throw new Error("connectWallet: No ethereum object");
    }
  };

  // Creates a new user in the smart contract.
  const createUser = async () => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const requiredGewi = 10000000000000000;

      if (balance < requiredGewi) {
        setErrorMessage("Your wallet balance is below the minimum required balance of 0.01 ETH.");
        return false; 
      }

      setLoading(true); 

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.createUser();
      await tx.wait();

      setIsUserCreated(true);
      setErrorMessage(''); 
      return true; 
    } catch (error) {
      console.log("createUser: Error creating user: ", error);
      setErrorMessage("Error creating user. Please try again.");
      return false; 
    } finally {
      setLoading(false);
    }
  };

  // Allows the user to join a goal in the smart contract.
  const joinGoal = async (goalId, amount) => {
    try {
      if (!currentAccount) throw new Error("Wallet is not connected");
  
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      if (typeof amount !== 'string') {
        amount = amount.toString();
      }
      const parsedAmount = ethers.parseEther(amount); 
  
      const tx = await contract.joinGoal(goalId, { value: parsedAmount});
      await tx.wait();
  
      alert("Successfully joined the goal!");
    } catch (error) {
      console.error("Failed to join goal:", error);
      alert(`Failed to join the goal. ${error.reason}.`);
    }
  };

  // Allows the user to claim rewards for a completed goal.
  const claimRewards = async (goalId) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.claimRewards(goalId);
      setLoading(true);
      await tx.wait();
      console.log(`Claim rewards tx hash: ${tx.hash}`);
    } catch (error) {
      console.error("Failed to Claim Rewards:", error.reason);
    } finally {
      setLoading(false);
    }
  };

  // Returns the Id that is mapped the the users wallet address.
  const getUserId = async (walletAddress) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const userId = await contract.getUserId(walletAddress);
      return Number(userId);
    } catch (error) {
      console.error("Error fetching user ID:", error);
      throw error;
    }
  };

  // Checks if the user is authorized with Strava.
  const checkStravaAuthorization = async (walletAddress) => {
    try {
      const response = await fetch('/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (response.ok) {
        console.log('Strava authorization status: True');
        return true;
      } else {
        console.log('Strava authorization status: False');
        return false;
      }
    } catch (error) {
      console.error("Error checking Strava authorization: ", error);
      return false;
    }
  };

  // Fetches the participant addresses and their respective Strava tokens for a given goal.
  const fetchTokens = async (goalId) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      const participants = await contract.getParticipantAddresses(goalId);
  
      const participantTokens = {};
  
      await Promise.all(participants.map(async (address) => {
        const response = await fetch('/api/get-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: address }),
        });
  
        if (response.ok) {
          const fetched = await response.json();
          participantTokens[fetched.data.userId] = fetched.data.accessToken; // Assign userId as key and accessToken as value
        } else {
          console.error(`Error fetching token for address: ${address}`);
          participantTokens[address] = null; // Assign null if there was an error
        }
      }));
  
      return participantTokens;
    } catch (error) {
      console.error("Error fetching participants and tokens:", error);
    }
  };

  // Requests data from the smart contract using chainlink .
  const requestData = async (activityType, goalId) =>{

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const fetchedData = await fetchTokens(goalId);

      const parsedData = JSON.stringify(fetchedData)

      console.log(`TransactionContext requestDataTest Called.`);
      console.log(`Activity Type: ${activityType}. Goal ID: ${goalId}.`)
      console.log(`Request Data: ${parsedData}`);

      const tx = await contract.executeRequest(parsedData, activityType, goalId);
      console.log(`TransactionContext requestData Executed. Tx Hash: ${tx.hash}`);

    } catch (error){
      console.error('Error requesting Data:', error);
    }
  };
  
  const assignDistance = async (goalId) => {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const response = await contract.getActivityWithGoalId(goalId);
      const parsedResponse = JSON.parse(response.activityData);

      console.log('Assign Data Called.');
      console.log(`Data in Array: ${parsedResponse}`);
      
      await contract.assignDistance(parsedResponse, goalId);
    }

    catch(error){
      console.log(error);
    }

  }

  // Effect to check if the wallet is connected and set up event listeners for account changes.
  useEffect(() => {
    checkIfWalletIsConnected();

    if (ethereum) {
      ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length) {
          setCurrentAccount(accounts[0]);
          const userExists = await checkUserExists(accounts[0]);
          const stravaAuthorized = await checkStravaAuthorization(accounts[0]);

          setIsUserCreated(userExists);
          setIsStravaAuthorized(stravaAuthorized);

        } else {
          setCurrentAccount('');
          setIsUserCreated(false);
          setIsStravaAuthorized(false);
        }
      });
    }
  }, []);

  return (
    <TransactionContext.Provider value={{
      currentAccount,
      isUserCreated,
      isStravaAuthorized,
      errorMessage,
      loading,
      connectWallet,
      createUser,
      joinGoal,
      claimRewards,
      fetchTokens,
      requestData,
      assignDistance,
      getUserId,
      setErrorMessage,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
