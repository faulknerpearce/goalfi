import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import UserGoalCard from "./UserGoalCard";
import DashboardCard from "./DashboardCard";
import { fetchGoals } from "../utils/fetchGoals";
import { getGoalsForUser } from "../utils/getGoalsForUser";
import { AreaChart, Area, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { FaTrophy, FaTimesCircle, FaTasks } from "react-icons/fa";

const Dashboard = () => {
  const { currentAccount } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [failedGoals, setFailedGoals] = useState(0);
  const [totalGoalsJoined, setTotalGoalsJoined] = useState(0);
  const [showActiveGoals, setShowActiveGoals] = useState(true);
  const [goalsFetched, setGoalsFetched] = useState(false);

  useEffect(() => {
    const fetchUserGoals = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const userGoals = await getGoalsForUser(currentAccount);

      const [activeGoals, expiredGoals] = await Promise.all([fetchGoals(provider, false), fetchGoals(provider, true),]);

      const allGoals = [...activeGoals, ...expiredGoals];
      
      const userGoalDetails = allGoals.filter(goal => userGoals.some(userGoal => userGoal.goalId === goal.id));

      let completedCount = 0;
      let failedCount = 0;

      userGoalDetails.forEach(goal => {
        const userGoal = userGoals.find(userGoal => userGoal.goalId === goal.id);
        
        if (Number(userGoal.progress) === 4 || Number(userGoal.progress) === 3){
          completedCount++;
        } else if (Number(userGoal.progress) === 2) {
          failedCount++;
        }
      });
      
      const totalJoined = userGoalDetails.length;
  
      setCompletedGoals(completedCount);
      setFailedGoals(failedCount);
      setTotalGoalsJoined(totalJoined);
      setGoals(userGoalDetails);
    };

    if (currentAccount && !goalsFetched) {
      fetchUserGoals();
      setGoalsFetched(true);
    }
  }, [currentAccount]);

  const earningsData = [
    { earnings: 400 },
    { earnings: 300 },
    { earnings: 350 },
    { earnings: 178 },
    { earnings: 289 },
    { earnings: 275 },
    { earnings: 300 }
  ];

  const displayedGoals = showActiveGoals
    ? goals.filter(goal => goal.hours > 0 || goal.minutes > 0)
    : goals.filter(goal => goal.hours <= 0 && goal.minutes <= 0);


  return (
    <div className="flex flex-col w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4 w-full">
        <div className="flex flex-col w-full mb-10 white-glassmorphism p-6 rounded-lg border border-gray-700 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-stretch w-full gap-10">
            <div className="flex flex-col justify-between h-full md:w-1/4 space-y-4">
              <DashboardCard
                title="Goals Completed"
                value={completedGoals}
                icon={<FaTrophy fontSize={21} className="text-white" />}
                height="h-22"
              />
              <DashboardCard
                title="Goals Failed"
                value={failedGoals}
                icon={<FaTimesCircle fontSize={21} className="text-white" />}
                height="h-22"
              />
              <DashboardCard
                title="Goals Joined"
                value={totalGoalsJoined}
                icon={<FaTasks fontSize={21} className="text-white" />}
                height="h-22"
              />
            </div>
            <div className="flex flex-col justify-between w-full md:w-1/4 h-full">
              <div className="white-glassmorphism p-6 rounded-lg border border-gray-700 h-full flex justify-center items-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-5">Total Amount Won</h3>
                  <p className="text-white text-xl">{`${12.34} AVAX`}</p> 
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between w-full md:w-1/2 h-full">
              <div className="white-glassmorphism p-6 rounded-lg border border-gray-700 h-full">
                <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide={true} domain={['dataMin', 'dataMax']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="earnings" stroke="#82ca9d" fillOpacity={1} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Your Goals
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          View all the goals you have participated in.
        </p>
        <div className="flex justify-center space-x-4 mb-10">
          <button
            className={`text-white px-10 py-2 rounded-full ${showActiveGoals ? "bg-orange-700 hover:bg-orange-800" : "bg-gray-500 hover:bg-gray-600"}`}
            onClick={() => setShowActiveGoals(true)}
          >
            Active Goals
          </button>
          <button
            className={`text-white px-10 py-3 rounded-full ${!showActiveGoals ? "bg-orange-700 hover:bg-orange-800" : "bg-gray-500 hover:bg-gray-600"}`}
            onClick={() => setShowActiveGoals(false)}
          >
            Past Goals
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto mt-10">
          {displayedGoals.map((goal) => (
            <UserGoalCard key={goal.id} goal={goal} showClaimButton={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
