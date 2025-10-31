import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../providers/goalfi.js";
import { FaRunning, FaBiking, FaWalking } from "react-icons/fa";

const { ethereum } = window;

export const GoalfiContext = createContext();

export const useGoalfi = () => {
  const context = useContext(GoalfiContext);
  if (!context) {
    throw new Error("useGoalfi must be used within a GoalfiProvider");
  }
  return context;
};

export const GoalfiProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to ensure we're on the correct network
  const ensureCorrectNetwork = async () => {
    try {
      if (!ethereum) {
        throw new Error("MetaMask not found");
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      const expectedChainId = 43113n; // Avalanche Fuji
      
      if (chainId !== expectedChainId) {
        console.log(`Wrong network detected. Attempting to switch from ${chainId} to ${expectedChainId}`);
        
        // Try to switch network
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa869' }], // 43113 in hex
          });
          console.log("Successfully switched to Avalanche Fuji");
          return true;
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xa869',
                  chainName: 'Avalanche Fuji C-Chain',
                  nativeCurrency: {
                    name: 'AVAX',
                    symbol: 'AVAX',
                    decimals: 18
                  },
                  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://testnet.snowtrace.io/']
                }]
              });
              console.log("Successfully added and switched to Avalanche Fuji");
              return true;
            } catch (addError) {
              throw new Error("Failed to add Avalanche Fuji network");
            }
          }
          throw new Error(`Please switch to Avalanche Fuji Testnet in MetaMask`);
        }
      }
      return true;
    } catch (error) {
      console.error("Network check failed:", error);
      throw error;
    }
  };

  // ============ Smart Contract Functions ============

  // Checks if a user exists in the smart contract for the given address.
  const checkUserExists = async (address) => {
    try {
      if (!ethereum) {
        console.error("checkUserExists: Ethereum object not found");
        return false;
      }

      // Ensure we're on the correct network
      await ensureCorrectNetwork();

      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Check if contract exists at address
      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        console.error(`checkUserExists: No contract found at address ${contractAddress}`);
        return false;
      }

      const addressUsed = await contract.userAddressUsed(address);
      return addressUsed;
    } catch (error) {
      console.error("checkUserExists: Error checking user existence: ", error);
      return false;
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
        console.log("Error message set:", errorMessage);
        return false;
      }

      setLoading(true);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.createUser();
      await tx.wait();

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
      if (!ethereum) throw new Error("Ethereum object not found");

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Ensure amount is a string for the parseEther function
      if (typeof amount !== 'string') {
        amount = amount.toString();
      }
      const parsedAmount = ethers.parseEther(amount);

      // Send transaction to join goal
      const tx = await contract.joinGoal(goalId, { value: parsedAmount });
      await tx.wait();
      alert("Successfully joined the goal!");
    } catch (error) {
      alert(`${error.reason}`);
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

  // Returns the Id that is mapped to the users wallet address.
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

  // Gets participant addresses for a specific goal from the smart contract
  const getParticipantAddresses = async (goalId) => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const participants = await contract.getParticipantAddresses(goalId);
      return participants;
    } catch (error) {
      console.error("Error fetching participant addresses:", error);
      throw error;
    }
  };

  // Requests data from the smart contract using chainlink.
  const requestData = async (activityType, goalId, startTimestamp, expiryTimestamp, participantTokens) => {
    console.log(`Requesting data for Goal ID: ${goalId}. Start: ${startTimestamp}. Expires: ${expiryTimestamp}`)

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      console.log(participantTokens)

      const accessTokens = JSON.stringify(participantTokens)

      const tx = await contract.executeRequest(accessTokens, activityType, goalId, startTimestamp, expiryTimestamp);
      alert("Successfully Requested Progress.");
      console.log(`goalfiContext requestData Executed. Tx Hash: ${tx.hash}`);

    } catch (error) {
      console.error('Error requesting Data:', error);
    }
  };

  // ============ Utility Functions from fetchGoals.jsx ============

  // Function to calculate the remaining time until a given goal expires.
  const calculateRemainingTime = (timestamp) => {
    const currentTime = new Date();
    const expiryTime = new Date(Number(timestamp) * 1000);

    const timeDifferenceInMilliseconds = expiryTime - currentTime;
    const timeDifferenceInHours = Math.floor(timeDifferenceInMilliseconds / 3600000);
    const timeDifferenceInMinutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);

    return {
      hours: timeDifferenceInHours,
      minutes: timeDifferenceInMinutes
    };
  };

  // Function to calculate the remaining time until a goal can no longer be joined.
  const calculateRemainingTimeToJoin = (startTimestamp) => {
    const startTime = new Date(Number(startTimestamp) * 1000);
    const currentTimestamp = new Date().getTime();

    const timeDifferenceInMilliseconds = startTime - currentTimestamp;

    const timeDifferenceInHours = Math.floor(timeDifferenceInMilliseconds / 3600000);
    const timeDifferenceInMinutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);

    return {
      RemaingHours: timeDifferenceInHours,
      RemaingMinutes: timeDifferenceInMinutes
    };
  };

  // Function to calculate the duration of a goal in days and hours.
  const calculateGoalDuration = (startTimestamp, expiryTimestamp) => {
    const startTime = new Date(Number(startTimestamp) * 1000);
    const expiryTime = new Date(Number(expiryTimestamp) * 1000);

    const timeDifferenceInMilliseconds = expiryTime - startTime;
    const timeDifferenceInDays = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));
    const timeDifferenceInHours = Math.floor((timeDifferenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      days: timeDifferenceInDays,
      hours: timeDifferenceInHours
    };
  };

  // Function to map activity types to corresponding icons and colors.
  const getIconAndColor = (activity) => {
    switch (activity) {
      case "RUNNING":
        return {
          stravaAPICall: 'Run',
          iconColor: "bg-[#2952E3]",
          icon: <FaRunning fontSize={21} className="text-white" />,
        };
      case "CYCLING":
        return {
          stravaAPICall: 'Ride',
          iconColor: "bg-[#298150]",
          icon: <FaBiking fontSize={21} className="text-white" />,
        };
      case "WALKING":
        return {
          stravaAPICall: 'Walk',
          iconColor: "bg-[#F84550]",
          icon: <FaWalking fontSize={21} className="text-white" />,
        };
      default:
        return {
          stravaAPICall: null,
          iconColor: "bg-gray-500",
          icon: <FaRunning fontSize={21} className="text-white" />,
        };
    }
  };

  // Function to fetch goals from the blockchain and format the data for display.
  const fetchGoals = async (provider, getExpired) => {
    try {
      // Ensure we're on the correct network first
      await ensureCorrectNetwork();
 
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const goalCount = await contract.goalCount();
      console.log(`Total goals on contract: ${goalCount}`);
      const fetchedGoals = [];

      for (let i = 0; i < goalCount; i++) {
        const goal = await contract.goals(i);
        const participantAddresses = await contract.getParticipantAddresses(i);

        // Skip goals that aren't set (deleted/closed)
        if (!goal.set) {
          continue;
        }

        const { iconColor, icon, stravaAPICall } = getIconAndColor(goal.activity);

        const goalDuration = calculateGoalDuration(goal.startTimestamp, goal.expiryTimestamp);
        const remainingTime = calculateRemainingTime(goal.expiryTimestamp);
        const remainingTimeToJoin = calculateRemainingTimeToJoin(goal.startTimestamp)

        const isActive = goal.startTimestamp > currentTimestamp;
        const includeGoal = getExpired ? !isActive : isActive;
        
        if (includeGoal) {
          fetchedGoals.push({
            id: i,
            category: goal.activity,
            title: goal.description,
            distance: Number(goal.distance),
            currentDeposits: ethers.formatUnits(goal.stake, 'ether'), // Format stake to Ether units.
            colour: "bg-orange-700",
            activeButtonColour: "bg-orange-600",
            nonActiveButtonColour: 'bg-gray-500',
            iconColor,
            icon,
            durationDays: goalDuration.days,
            durationHours: goalDuration.hours,
            hours: remainingTime.hours,
            minutes: remainingTime.minutes,
            RemaingHours: remainingTimeToJoin.RemaingHours,
            RemaingMinutes: remainingTimeToJoin.RemaingMinutes,
            startTimestamp: Number(goal.startTimestamp),
            expiryTimestamp: Number(goal.expiryTimestamp),
            participants: participantAddresses.length,
            participantAddresses,
            stravaAPICall
          });
        }
      }

      console.log(`fetchGoals returning ${fetchedGoals.length} goals:`, fetchedGoals);
      return fetchedGoals; // Return the list of formatted goals.
    } catch (error) {
      console.error("fetchGoals: Error fetching goals: ", error);
      return [];
    }
  };

  // ============ Utility Functions from getGoalsForUser.js ============

  // Function to fetch goals associated with a particular user.
  const getGoalsForUser = async (currentAccount) => {
    const provider = new ethers.BrowserProvider(globalThis.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Get total number of goals from the contract
    const goalCount = await contract.goalCount();
    const userGoals = [];

    // Loop through all goals to find ones where user is a participant
    for (let i = 0; i < goalCount; i++) {
      const participants = await contract.getParticipantAddresses(i);
      if (participants.map(p => p.toLowerCase()).includes(currentAccount.toLowerCase())) {
        // Fetch user's progress and distance data for this goal
        const userProgress = await contract.getParticipantProgress(i, currentAccount);
        const userDistance = await contract.getUserDistance(currentAccount, i);

        userGoals.push({
          goalId: i,
          progress: userProgress,
          userDistance: Number(userDistance)
        });
      }
    }
    return userGoals;
  };

  return (
    <GoalfiContext.Provider value={{
      errorMessage,
      loading,
      checkUserExists,
      createUser,
      joinGoal,
      claimRewards,
      getUserId,
      getParticipantAddresses,
      requestData,
      fetchGoals,
      getGoalsForUser,
      setErrorMessage,
    }}>
      {children}
    </GoalfiContext.Provider>
  );
};
