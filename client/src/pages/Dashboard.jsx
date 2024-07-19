import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import GoalCard from "../components/GoalCard";
import { fetchGoals } from "../utils/fetchGoals";
import { getGoalsForUser } from "../utils/fetchUserGoals";

const Dashboard = () => {
  const { currentAccount } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchUserGoals = async () => {
      const userGoals = await getGoalsForUser(currentAccount);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const fetchedGoals = await fetchGoals(provider);

      const userGoalDetails = fetchedGoals.filter(goal => userGoals.includes(goal.id));
      setGoals(userGoalDetails);
    };

    if (currentAccount) {
      fetchUserGoals();
    }
  }, [currentAccount]);

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Your Goals
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Here are the goals you have joined.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 w-full mt-10">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} showViewButton={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
