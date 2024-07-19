import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { fetchGoals } from "../utils/fetchGoals";

const Discover = () => {
  const { currentAccount, joinGoal } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);
  const [goalsFetched, setGoalsFetched] = useState(false);

  useEffect(() => {
    if (currentAccount && !goalsFetched) {
      const fetchData = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const fetchedGoals = await fetchGoals(provider);
          setGoals(fetchedGoals);
          setGoalsFetched(true);
        } catch (error) {
          console.error("Error fetching goals:", error);
          setGoalsFetched(true); // Set to true even if fetching fails to prevent retrying
        }
      };

      fetchData();
    }
  }, [currentAccount, goalsFetched]);

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Discover
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Explore various community goals and join the ones that suit you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mt-10">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} showJoinButton={true} joinGoal={joinGoal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;
