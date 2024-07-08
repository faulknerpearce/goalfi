import React, { useContext, useState } from "react";
import { TransactionContext } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { FaRunning } from "react-icons/fa";
import { FaWalking } from "react-icons/fa";
import { FaBiking } from "react-icons/fa";
;

const handleJoinGoal = (goalId) => {
  console.log(`Joining goal with id: ${goalId}`);
  // Add your logic to join the goal here
};

const Homepage = () => {
  const { currentAccount, connectWallet } = useContext(TransactionContext);
  const [goals, setGoals] = useState([
    {
      id: 1,
      category: "RUNNING",
      title: "Run 5km Everday for 4 Days",
      participants: 20,
      stakeTimeline: "4 DAYS",
      currentDeposits: 55,
      maxCapacity: 300,
      colour: "bg-blue-500", 
      iconColor: "bg-[#2952E3]", 
      icon: <FaRunning fontSize={21} className="text-white" />
    },
    {
      id: 2,
      category: "CYCILING",
      title: "Ride 10km for 7 Consecutive Days.",
      participants: 15,
      stakeTimeline: "7 DAYS",
      currentDeposits: 175,
      maxCapacity: 300,
      colour: "bg-blue-500", 
      iconColor: "bg-[#298150]",
      icon: <FaBiking fontSize={21} className="text-white" />
    },
    {
      id: 3,
      category: "WALKING",
      title: "Walk 10,000 Steps in a Single Day.",
      participants: 15,
      stakeTimeline: "1 DAY",
      currentDeposits: 225,
      maxCapacity: 300,
      colour: "bg-blue-500", 
      iconColor: "bg-[#F84550]",
      icon: <FaWalking fontSize={21} className="text-white" />
    },
  ]);

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Invest in your goals
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Participate in various community goals and earn rewards for your accomplishments.
          </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-10">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} joinGoal={handleJoinGoal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
