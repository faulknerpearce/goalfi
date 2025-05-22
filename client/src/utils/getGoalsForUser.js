import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

// Function to fetch goals associated with a particular user.
export const getGoalsForUser = async (currentAccount) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
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