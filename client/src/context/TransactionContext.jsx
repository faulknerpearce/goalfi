import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

export const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isUserCreated, setIsUserCreated] = useState(false);

  const checkUserExists = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const addressUsed = await contract.userAddressUsed(address);
      console.log(`checkUserExists: checking address: ${address}`);
      console.log(`checkUserExists: address used: ${addressUsed}`);
      
      return addressUsed
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
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.createUser();
      await tx.wait();
      setIsUserCreated(true);
      console.log("createUser: User created successfully");
    } catch (error) {
      console.log("createUser: Error creating user: ", error);
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
    <TransactionContext.Provider value={{ connectWallet, currentAccount, isUserCreated, createUser }}>
      {children}
    </TransactionContext.Provider>
  );
};
