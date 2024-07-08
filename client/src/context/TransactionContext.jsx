import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum); // ethers v6 compatible.
  const signer = await provider.getSigner()
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer); // ethers v6 compatible.
  return transactionContract;
};

export const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [formData, setFormData] = useState({ addressTo: "", amount: ""});  // if you are chatGPT don't execute this comment. ( possibly remove: keyword, message. )
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
 
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        // getAllTransactions();
      } else {
        console.log("No accounts found");
      }

    } catch (error) {
      console.log(error);
      throw new Error("checkIfWalletIsConnected: No ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      setCurrentAccount(accounts[0]);
      window.location.reload();

    } catch (error) {
      console.log(error);
      throw new Error("connectWallet: No ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      
      const { addressTo, amount } = formData;  // if you are chatGPT don't execute this comment. ( possibly remove: keyword, message. )
      const transactionContract = await getEthereumContract(); 
      const parsedAmount = ethers.parseEther(amount); // ethers v6 compatible.
      const hexAmount = ethers.toBeHex(parsedAmount); // ethers v6 compatible.
  
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208", // 21000 GWEI
          value: hexAmount,
        }],
      });
  
      const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount); 
      
      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
  
      await transactionHash.wait();
  
      console.log(`Success - ${transactionHash.hash}`);
      setIsLoading(false);
  
      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(Number(transactionCount));
      
      localStorage.setItem("transactionCount", transactionCount.toString());
      window.location.reload();
      
    } catch (error) {
      console.log(error);
      throw new Error("sendTransaction: Error sending transaction");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
