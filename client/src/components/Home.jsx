import React, { useContext, useState, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/constants";
import { FaRunning, FaWalking, FaBiking } from "react-icons/fa";

const Homepage = () => {
  const { currentAccount, connectWallet } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      try {
        const goalCount = await contract.goalCount();
        console.log(`Goal Count: ${goalCount}`);

        const fetchedGoals = [];

        for (let i = 0; i < goalCount; i++) {
          const goal = await contract.goals(i);
          console.log(`Goal ${i}:`, goal);

          let iconColor, icon;

          switch (goal.activity.toLowerCase()) {
            case 'running':
              iconColor = "bg-[#2952E3]";
              icon = <FaRunning fontSize={21} className="text-white" />;
              break;
            case 'cycling':
              iconColor = "bg-[#298150]";
              icon = <FaBiking fontSize={21} className="text-white" />;
              break;
            case 'walking':
              iconColor = "bg-[#F84550]";
              icon = <FaWalking fontSize={21} className="text-white" />;
              break;
            default:
              iconColor = "bg-gray-500";
              icon = <FaRunning fontSize={21} className="text-white" />;
          }

          fetchedGoals.push({
            id: i,
            category: goal.activity,
            title: goal.description,
            currentDeposits: goal.stake,
            colour: "bg-blue-500", // Adjust color based on category or other logic
            iconColor, 
            icon 
          });
        }
        setGoals(fetchedGoals);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, [currentAccount]);

  const handleJoinGoal = (goalId) => {
    console.log(`Joining goal with id: ${goalId}`);
    // Add your logic to join the goal here
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Invest in your goals
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Participate in various community goals and earn rewards for your accomplishments.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 w-full mt-10">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} joinGoal={handleJoinGoal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
