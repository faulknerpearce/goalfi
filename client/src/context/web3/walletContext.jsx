import { createContext, useContext, useState, useEffect } from "react";

const { ethereum } = window;

export const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isUserCreated, setIsUserCreated] = useState(false);

  // ============ Wallet Functions ============

  // Checks if the wallet is connected and updates the state accordingly.
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
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
    const desiredNetworkId = '0xa869'; // Avalanche Fuji Testnet Chain ID (43113) in hexadecimal

    try {
      if (!ethereum) return alert("connectWallet: Please install MetaMask.");

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);

      // Check the current network
      const currentChainId = await ethereum.request({ method: "eth_chainId" });

      // If the network is not the desired network, request to switch
      if (currentChainId !== desiredNetworkId) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredNetworkId }],
          });
          console.log(`Switched to network with Chain ID: ${desiredNetworkId}`);
        } catch (switchError) {
          // If the desired network is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: desiredNetworkId,
                    chainName: 'Avalanche Fuji C-Chain', // Network name for Fuji testnet
                    nativeCurrency: {
                      name: 'AVAX',
                      symbol: 'AVAX', // Currency symbol
                      decimals: 18,
                    },
                    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'], // RPC URL for the desired network
                    blockExplorerUrls: ['https://testnet.snowtrace.io/'], // Block explorer URL for the network
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add network:", addError);
              return;
            }
          } else {
            console.error("Failed to switch network:", switchError);
            return;
          }
        }
      }

      // The WalletInitializer will handle checking user exists and strava auth
    } catch (error) {
      console.log(error);
      throw new Error("connectWallet: No ethereum object");
    }
  };

  // Function to shorten wallet addresses for display
  const shortenAddress = (address) => `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;

  // Effect to check if the wallet is connected and set up event listeners for account changes.
  useEffect(() => {
    const setupWallet = async () => {
      // Check if wallet is already connected
      try {
        if (!ethereum) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length) {
          setCurrentAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking initial wallet connection:", error);
      }

      // Set up account change listener
      if (ethereum) {
        ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length) {
            setCurrentAccount(accounts[0]);
          } else {
            setCurrentAccount('');
            setIsUserCreated(false);
          }
        });
      }
    };

    setupWallet();
  }, []);

  return (
    <WalletContext.Provider value={{
      currentAccount,
      isUserCreated,
      setIsUserCreated,
      checkIfWalletIsConnected,
      connectWallet,
      shortenAddress,
    }}>
      {children}
    </WalletContext.Provider>
  );
};