import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

// Function to fetch goals associated with a particular user.
export const getGoalsForUser = async (currentAccount) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const goalCount = await contract.goalCount();
  const userGoals = [];

  for (let i = 0; i < goalCount; i++) {
    const participants = await contract.getParticipantAddresses(i);
    if (participants.map(p => p.toLowerCase()).includes(currentAccount.toLowerCase())) {
      const userProgress = await contract.getParticipantProgress(i, currentAccount);
      const userDistance = await contract.getUserDistance(currentAccount, i)
      //console.log(`Goal ${i} - User progress: ${userProgress}`);
      //console.log(`User Distance: ${userDistance}. for Goal ID: ${i}`)
      userGoals.push({
        goalId: i,
        progress: userProgress,
        userDistance: Number(userDistance)
      });
    }
  }
  return userGoals;
};