import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

export const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [loading, setLoading] = useState(false); 

  const checkUserExists = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const addressUsed = await contract.userAddressUsed(address);

      console.log(`checkUserExists: checking address: ${address}`);
      console.log(`checkUserExists: address used: ${addressUsed}`);

      return addressUsed;
    } catch (error) {
      console.error("checkUserExists: Error checking user existence: ", error);
      return false;
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        const userExists = await checkUserExists(accounts[0]);

        console.log(`checkIfWalletIsConnected: User exists for ${accounts[0]}:`, userExists);
        setIsUserCreated(userExists);
      } else {
        console.log("checkIfWalletIsConnected: No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("checkIfWalletIsConnected: No ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("connectWallet: Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      const userExists = await checkUserExists(accounts[0]);

      console.log(`connectWallet: User exists for ${accounts[0]}:`, userExists);

      setIsUserCreated(userExists);
    } catch (error) {
      console.log(error);
      throw new Error("connectWallet: No ethereum object");
    }
  };

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
      alert("Failed to join the goal. Please try again.");
    }
  };

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
      console.error("Failed to Claim Rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch token using wallet address
  const fetchToken = async () => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const response = await fetch('/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`At fetchTokn in TransactionContext`);
      console.log(`Access Token: ${data.accessToken}. Wallet Address: ${walletAddress}`);

    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (ethereum) {
      ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length) {
          setCurrentAccount(accounts[0]);
          const userExists = await checkUserExists(accounts[0]);

          console.log(`User exists for ${accounts[0]}:`, userExists);

          setIsUserCreated(userExists);
        } else {
          setCurrentAccount('');
          setIsUserCreated(false);
        }
      });
    }
  }, []);

  return (
    <TransactionContext.Provider value={{
      connectWallet,
      currentAccount,
      isUserCreated,
      createUser,
      joinGoal,
      claimRewards,
      fetchToken,
      errorMessage,
      setErrorMessage,
      loading
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
