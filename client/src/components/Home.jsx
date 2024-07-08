import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { contractABI, contractAddress } from "../utils/constants";
import { FaRunning, FaBiking, FaWalking } from "react-icons/fa";

const handleJoinGoal = (goalId) => {
  console.log(`Joining goal with id: ${goalId}`);
  // Add your logic to join the goal here
};

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

const fetchGoals = async (provider) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const goalCount = await contract.goalCount();
  const fetchedGoals = [];

  for (let i = 0; i < goalCount; i++) {
    const goal = await contract.goals(i);
    
    if (goal.expiryTimestamp > currentTimestamp && fetchedGoals.length < 3){
      const participantAddresses = await contract.getParticipantAddresses(i); 
      const { iconColor, icon, stravaAPICall } = getIconAndColor(goal.activity);

      console.log("Goal fetched:", goal);
      console.log("Strava API Call:", stravaAPICall);

      fetchedGoals.push({
        id: i,
        category: goal.activity,
        title: goal.description,
        currentDeposits: ethers.formatUnits(goal.stake, 'ether'),
        maxCapacity: 300,
        colour: "bg-blue-500",
        iconColor,
        icon,
        startTimestamp: Number(goal.startTimestamp),
        expiryTimestamp: Number(goal.expiryTimestamp),
        participants: participantAddresses.length, 
        participantAddresses, // Store the actual addresses for further use if needed
        stravaAPICall // convert running to run, walking to walk, cycling to ride for the strava api call.
      });
    }
  }

  return fetchedGoals;
};

const Homepage = () => {
  const { currentAccount, connectWallet } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.send("eth_requestAccounts", []).then(() => {
      fetchGoals(provider)
        .then(fetchedGoals => setGoals(fetchedGoals))
        .catch(error => console.error("Error fetching goals:", error));
    });
  }, [currentAccount]);

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Invest in your goals
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Participate in various community goals and earn rewards for your accomplishments.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 w-full mt-10">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} joinGoal={handleJoinGoal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
