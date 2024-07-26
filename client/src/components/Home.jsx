import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import { GoalCard } from "../components";
import { fetchGoals } from "../utils/fetchGoals";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Loader from "../components/Loader"; 

const Homepage = () => {
  const { currentAccount } = useContext(TransactionContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (currentAccount) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      provider.send("eth_requestAccounts", []).then(() => {
        setLoading(true);
        fetchGoals(provider, false)
          .then(fetchedGoals => {
            const goalTypes = ['RUNNING', 'WALKING', 'CYCLING'];
            const goalsByCategory = {};

            goalTypes.forEach(type => {
              goalsByCategory[type] = [];
            });

            fetchedGoals.forEach(goal => {
              if (goalsByCategory[goal.category] && goalsByCategory[goal.category].length < 3) {
                goalsByCategory[goal.category].push(goal);
              }
            });

            const filteredGoals = goalTypes.map(type => goalsByCategory[type][0]).filter(Boolean);

            setGoals(filteredGoals);
            setLoading(false);  
          })
          .catch(error => {
            console.error("Error fetching goals:", error);
            setLoading(false); 
          });
      });
    }
  }, [currentAccount]);

  const nextGoal = () => {
    setAnimationClass("slide-out-left");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % goals.length);
      setAnimationClass("slide-in-right");
    }, 400);
  };

  const prevGoal = () => {
    setAnimationClass("slide-out-right");
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + goals.length) % goals.length);
      setAnimationClass("slide-in-left");
    }, 400);
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Invest in Your Goals
        </h1>
        <p className="text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-2xl mb-10">
          Participate in various community goals and earn rewards for your accomplishments.
        </p>
        <div className="flex justify-center items-center w-full mt-10">
          <button
            onClick={prevGoal}
            className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full mr-8"
          >
            <FaArrowLeft />
          </button>
          <div className="flex justify-center items-center w-full max-w-md mx-4">
            {loading ? (<Loader />  ) : (goals.length > 0 && (<div className={`w-full ${animationClass}`}><GoalCard key={goals[currentIndex].id} goal={goals[currentIndex]} showViewButton={true} /></div>))}
          </div>
          <button
            onClick={nextGoal}
            className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full ml-8"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
