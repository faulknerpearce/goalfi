import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { fetchGoals } from "../utils/fetchGoals";

const Discover = () => {
  const { currentAccount } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);

  const joinGoal = async (goalId) => {
    console.log(`Joining goal with id: ${goalId}`);
    // Add your logic to join the goal here
  };

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
          Discover
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Explore various community goals and join the ones that suit you.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-0 w-full mt-10">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} showJoinButton={true} joinGoal={joinGoal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;
