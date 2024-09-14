import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TransactionContext } from "../context/TransactionContext";
import { GoalCard } from "../components";
import { fetchGoals } from "../utils/fetchGoals";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Loader from "../components/Loader"; 

// Homepage component displays a list of goals and allows navigation between them.
const Homepage = () => {
  const { currentAccount, connectWallet} = useContext(TransactionContext);
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

 // Function to navigate to the next goal in the list.
  const nextGoal = () => {
    setAnimationClass("homepage-flip-out-left"); // Use the renamed class
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % goals.length);
      setAnimationClass("homepage-flip-in-right"); // Use the renamed class
    }, 400);  // Match the timing to the animation duration
  };

  // Function to navigate to the previous goal in the list.
  const prevGoal = () => {
    setAnimationClass("homepage-flip-out-right"); // Use the renamed class
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + goals.length) % goals.length);
      setAnimationClass("homepage-flip-in-left"); // Use the renamed class
    }, 400);
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4 w-full">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">Featured Goals</h1>
        <p className="hidden md:block text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-2xl mb-10">
          Participate in community goals and earn rewards for your accomplishments.
        </p>

        {/* Display "Connect Wallet" button if the wallet is not connected */}
        {!currentAccount ? (
          <button
            onClick={connectWallet} // Call connectWallet function when clicked
            className="mt-10 text-white px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-full text-lg block md:hidden">
              Connect Wallet to View Goals
          </button>
        ) : (
          <>
            {/* Container for buttons and card */}
            <div className="flex flex-col md:flex-row justify-center items-center w-full mt-10 space-y-4 md:space-y-0 md:space-x-8 lg:space-x-6 md:max-w-xl lg:max-w-lg">
              {/* Previous button */}
              <button
                onClick={prevGoal}
                className="hidden md:block prev-button text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full w-md"
              >
                <FaArrowLeft />
              </button>

              {/* Card container */}
              <div className="homepage-flip-card-container w-full max-w-md md:w-auto">
                <div className={`homepage-flip-card ${animationClass}`}>
                  {loading ? (
                    <Loader />
                  ) : (
                    goals.length > 0 && (
                      <GoalCard
                        key={goals[currentIndex].id}
                        goal={goals[currentIndex]}
                        showViewButton={true}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Next button */}
              <button
                onClick={nextGoal}
                className="next-button text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full w-md"
              >
                <FaArrowRight />
              </button>
            </div>

            {/* Dots below the card */}
            <div className="flex mt-4 space-x-2">
              {goals.map((goal, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? "bg-white" : "bg-gray-400"
                  }`}
                ></span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Homepage;