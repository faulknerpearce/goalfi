import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import { fetchGoals } from "../utils/fetchGoals";
import { getGoalsForUser } from "../utils/getGoalsForUser";
import { FaTrophy, FaTimesCircle, FaTasks } from "react-icons/fa";
import React, { useContext, useEffect, useState } from "react";
import UserGoalCard from "../components/UserGoalCard";
import DashboardCard from "../components/DashboardCard";
import DashboardChart from '../components/DashboardChart';
import Loader from "../components/Loader";

const Dashboard = () => {
  const { currentAccount, claimRewards, requestData } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [failedGoals, setFailedGoals] = useState(0);
  const [totalGoalsJoined, setTotalGoalsJoined] = useState(0);
  const [showActiveGoals, setShowActiveGoals] = useState(true);
  const [goalsFetched, setGoalsFetched] = useState(false);
  const [goalHistory, setGoalHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserGoals = async () => {
      setLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const userGoals = await getGoalsForUser(currentAccount);

        const [activeGoals, expiredGoals] = await Promise.all([
          fetchGoals(provider, false),
          fetchGoals(provider, true),
        ]);

        const allGoals = [...activeGoals, ...expiredGoals];

        const userGoalDetails = allGoals
          .map((goal) => {
            const userGoal = userGoals.find((userGoal) => userGoal.goalId === goal.id);
            return {
              ...goal,
              userDistance: userGoal ? userGoal.userDistance : 0,
              progress: userGoal ? userGoal.progress : null,
            };
          })
          .filter((goal) => goal.progress !== null);

        let completedCount = 0;
        let failedCount = 0;
        let goalJoinHistory = {};

        userGoalDetails.forEach((goal) => {
          if (Number(goal.progress) === 4 || Number(goal.progress) === 3) {
            completedCount++;
          } else if (Number(goal.progress) === 2) {
            failedCount++;
          }
          const joinDate = new Date(goal.expiryTimestamp * 1000).toLocaleDateString();
          if (!goalJoinHistory[joinDate]) {
            goalJoinHistory[joinDate] = 0;
          }
          goalJoinHistory[joinDate]++;
        });

        const goalHistoryArray = Object.keys(goalJoinHistory).map((date) => ({
          date,
          goalsJoined: goalJoinHistory[date],
        }));

        setCompletedGoals(completedCount);
        setFailedGoals(failedCount);
        setTotalGoalsJoined(userGoalDetails.length);
        setGoals(userGoalDetails);
        setGoalHistory(goalHistoryArray);
      } catch (error) {
        console.error("Error fetching user goals:", error);
      } finally {
        setLoading(false);
        setGoalsFetched(true);
      }
    };

    if (currentAccount && !goalsFetched) {
      fetchUserGoals();
    }
  }, [currentAccount]);

  const displayedGoals = showActiveGoals
    ? goals.filter((goal) => goal.hours > 0 || goal.minutes > 0)
    : goals.filter((goal) => goal.hours <= 0 && goal.minutes <= 0);

    return (
      <div className="flex flex-col w-full justify-center items-center">
        <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4 w-full">
          <div className="flex flex-col w-full mb-10 white-glassmorphism p-6 rounded-lg border border-gray-700 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-stretch w-full gap-10">
              {/* Adjust responsive behavior here */}
              <div className="flex flex-col justify-between h-full w-full sm:w-full md:w-1/4 space-y-4">
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
                  <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>
                  <DashboardChart data={goalHistory} />
                </div>
              </div>
            </div>
          </div>
    
          <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">Your Goals</h1>
          <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
            View all the goals you have participated in.
          </p>
    
          <div className="flex justify-center space-x-4 mb-10">
            <button
              className={`text-white px-10 py-2 rounded-full ${
                showActiveGoals ? "bg-orange-700" : "bg-gray-500 hover:bg-gray-600"
              }`}
              onClick={() => setShowActiveGoals(true)}
            >
              Active Goals
            </button>
            <button
              className={`text-white px-10 py-3 rounded-full ${
                !showActiveGoals ? "bg-orange-700" : "bg-gray-500 hover:bg-gray-600"
              }`}
              onClick={() => setShowActiveGoals(false)}
            >
              Past Goals
            </button>
          </div>
    
          <div className={`grid w-md justify-items-center mt-10 ${loading ? "flex justify-center items-center" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"}`}>
            {loading ? (
              <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-center ">
                <Loader />
              </div>
            ) : (
              displayedGoals.map((goal) => (
                <UserGoalCard
                  key={goal.id}
                  goal={goal}
                  progress={goal.progress}
                  claimRewards={claimRewards}
                  requestData={requestData}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
};

export default Dashboard;
