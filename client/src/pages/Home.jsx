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
  const [flipClass, setFlipClass] = useState("show-card-1-homepage");

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
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % goals.length;
      setFlipClass(`show-card-${newIndex + 1}-homepage`);
      return newIndex;
    });
  };

  // Function to navigate to the previous goal in the list.
  const prevGoal = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + goals.length) % goals.length;
      setFlipClass(`show-card-${newIndex + 1}-homepage`);
      return newIndex;
    });
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
        <h1 className="text-3xl sm:text-5xl text-white py-2 text-gradient">
          Featured Goals
        </h1>
        <p className="hidden md:block text-center mt-5 text-white font-light md:w-9/12 w-11/12 text-2xl mb-10">
          Participate in community goals and earn rewards for your accomplishments.
        </p>

        {/* Responsive container for card and buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center w-full mt-10">
          
          {/* Previous button (hidden on small screens, shown on medium and larger screens) */}
          <button
            onClick={prevGoal}
            className="hidden md:block text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full md:mr-8 mb-4 md:mb-0">
            <FaArrowLeft />
          </button>

          {/* Card Container */}
          <div className="flip-card-homepage flex flex-col justify-center items-center w-full max-w-sm sm:max-w-md px-4 mx-auto">
            {loading ? ( 
              <Loader />
            ) : (
              goals.length > 0 && (
                <div className={`flip-card-inner-homepage ${flipClass}`}>
                  {goals.map((goal, index) => (
                    <div key={goal.id} className={`flip-card-side-homepage flip-card-side-${index + 1}-homepage`}>
                      <GoalCard goal={goal} showViewButton={true}/>
                    </div>
                  ))}
                </div>
              )
            )}

            <div className="flex mt-4">
              {goals.map((goal, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 mx-1 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
                ></span>
              ))}
            </div>
          </div>

          {/* Next button (visible on all screen sizes) */}
          <button
            onClick={nextGoal}
            className="text-white px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full md:ml-8 mt-4 md:mt-0"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
