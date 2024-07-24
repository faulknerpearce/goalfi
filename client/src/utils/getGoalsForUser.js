import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

export const getGoalsForUser = async (currentAccount) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  console.log("Current account:", currentAccount);

  const goalCount = await contract.goalCount();
  const userGoals = [];

  for (let i = 0; i < goalCount; i++) {
    const participants = await contract.getParticipantAddresses(i);
    if (participants.map(p => p.toLowerCase()).includes(currentAccount.toLowerCase())) {
      const userProgress = await contract.getParticipantProgress(i, currentAccount);
      console.log(`Goal ${i} - User progress: ${userProgress}`);
      userGoals.push({
        goalId: i,
        progress: userProgress,
      });
    }
  }
  console.log("User goals:", userGoals);
  return userGoals;
};