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
      const requiredWei = 10000000000000000;

      if (balance < requiredWei) {
        setErrorMessage("Your wallet balance is below the minimum required balance of 0.01 AVAX.");
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
      alert("Successfully claimed rewards!");
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
    const cookieName = `stravaAuthorized_${walletAddress}`;
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith(`${cookieName}=`));
  
    // If the cookie exists, use it
    if (cookieValue) {
      const stravaAuthorized = cookieValue.split('=')[1] === 'true';
      console.log(`Strava authorization status (from cookie): ${stravaAuthorized}`);
      return stravaAuthorized;
    }
  
    // If no cookie, proceed to check the API
    try {
      const response = await fetch(`https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/CheckIfVerified?walletAddress=${walletAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const responseData = await response.json(); 
  
      if (response.ok && responseData.found) {
        // If authorization found, set the cookie to true with 6-hour expiration.
        console.log('Strava authorization status: True');
        document.cookie = `${cookieName}=true; path=/; max-age=${60 * 60 * 6}`;  // 6 hours expiration.
        return true;
      } else {
        // If not authorized, set the cookie to false with 6-hour expiration
        console.log('Strava authorization status: False');
        document.cookie = `${cookieName}=false; path=/; max-age=${60 * 60 * 6}`; // 6 hours expiration.
        return false;
      }
    } catch (error) {
      console.error("Error checking Strava authorization: ", error);
      return false;
    }
  };
  

  // Move the functionality from the navbar for token handling here.
  const RequestAndSaveTokens = async (walletAddress) => {

  }

  const fetchToken = async (walletAddress) => {
    const lowerCaseAddress = walletAddress.toLowerCase();
    
    try {
      const response = await fetch(`https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/RefreshToken?walletAddress=${lowerCaseAddress}`, { // testing new endpoint.
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const fetched = await response.json();
        return { [fetched.userId]: fetched.accessToken };
      } else {
        console.error(`Error fetching token for address: ${lowerCaseAddress}`);
        const errorData = await response.json();
        console.error('Response details:', errorData);
      }
    } catch (error) {
      console.error(`Error fetching token:`, error);
    }
  
    return {};
  };
  
  const fetchParticipantsTokens = async (goalId) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const participants = await contract.getParticipantAddresses(goalId);
  
      const participantTokens = {};
  
      // Fetch tokens for all participants
      await Promise.all(participants.map(async (address) => {
        try {
          const tokens = await fetchToken(address); // tokens should be {userId: accessToken}
          const userId = Object.keys(tokens)[0];
          const accessToken = tokens[userId];
  
          participantTokens[userId] = accessToken;
        } catch (error) {
          console.error(`Error fetching token for address: ${address}`, error);
        }
      }));
      return participantTokens;
    } catch (error) {
      console.error("Error fetching all tokens:", error);
    }
  };
  
  // Requests data from the smart contract using chainlink .
  const requestData = async (activityType, goalId) =>{
    console.log(`Requesting data for goal: ${goalId}`);

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const fetchedData = await fetchParticipantsTokens(goalId);

      const parsedData = JSON.stringify(fetchedData)

      const tx = await contract.executeRequest(parsedData, activityType, goalId);
      alert("Successfully Requested Progress.");
      console.log(`TransactionContext requestData Executed. Tx Hash: ${tx.hash}`);

    } catch (error){
      console.error('Error requesting Data:', error);
    }
  };

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
      fetchToken,
      fetchParticipantsTokens, 
      requestData,
      getUserId,
      setErrorMessage,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
