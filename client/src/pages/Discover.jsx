import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useGoalfi } from "../context/web3/goalfiContext.jsx";
import { useWallet } from "../context/web3/walletContext.jsx";
import GoalCard from "../components/GoalCard.jsx";
import Loader from "../components/Loader.jsx";

const Discover = () => {
  const { joinGoal, fetchGoals } = useGoalfi();
  const { currentAccount, connectWallet } = useWallet();
  const [goals, setGoals] = useState([]);
  const [goalsFetched, setGoalsFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAccount && !goalsFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const fetchedGoals = await fetchGoals(provider);
          console.log('Discover page - fetchedGoals:', fetchedGoals);
          setGoals(fetchedGoals);
        } catch (error) {
          console.error("Error fetching goals:", error);
        } finally {
          setGoalsFetched(true);
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [currentAccount, goalsFetched, fetchGoals]);

  const handleConnectWallet = () => {
    connectWallet();
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Explore Goals.
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-xl mb-10">
          Browse our available activities and join the goal that aligns with you.
        </p>

        {!currentAccount ? (
          <button
            onClick={handleConnectWallet}
            className="mt-10 text-white px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-full text-lg">
              Connect Wallet to View Goals
          </button>
        ) : (
          <div className={`grid w-full mt-10 ${loading ? "flex justify-center items-center" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"}`}>
            {loading ? (
              <Loader /> 
            ) : (
              goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} showJoinButton={true} joinGoal={joinGoal} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
