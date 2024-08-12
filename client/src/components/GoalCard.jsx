import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader'

// The GoalCard component displays goal details and allows users to join or view goals.
const GoalCard = ({ goal, showJoinButton, showViewButton, joinGoal }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to navigate to the discover page to view goals.
  const handleViewGoal = () => {
    navigate('/discover');
  };

  // Function to handle joining a goal with a specified amount.
  const handleJoinGoal = async () => {
    if (amount && parseFloat(amount) > 0) {
      setIsLoading(true);
      try {
        await joinGoal(goal.id, amount);
        // Optionally, handle success notification or other actions
      } catch (error) {
        console.error("Error joining goal:", error.reason);
        // Optionally, handle error notification
      } finally {
        setIsLoading(false);
        setIsFlipped(false);

      }
    } else {
      alert("Please enter a valid amount to join the goal.");
    }
  };

  return (
    <div className="flip-card-container">
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-front flex flex-col justify-between h-full white-glassmorphism p-6 mx-10 my-4 cursor-pointer hover:shadow-xl rounded-lg border border-gray-700 w-full max-w-sm">
          <div>
            {/* Front Card Content */}
            <div className="flex justify-between items-center w-full mb-4">
              <span className={`text-sm font-semibold px-5 py-2 rounded-full text-white border border-gray-700 shadow-lg ${goal.iconColor}`}>{goal.category}</span>
              <div className={`w-10 h-10 rounded-full flex justify-center items-center border border-gray-700 ${goal.iconColor}`}>
                {typeof goal.icon === 'string' ? (<img src={goal.icon} alt="icon" className="w-full h-full" />) : (goal.icon)}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-6 text-white">{goal.title}</h3>
            <p className="text-gray-300 mb-4">{goal.description}</p>
            <div className="text-sm text-gray-300 w-full">
              <div className="flex justify-between mb-2">
                <span>Participants</span>
                <span>{goal.participants}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Goal Duration</span>
                <span>
                {goal.durationDays === 1 ? '1 day' : goal.durationDays > 1 ? `${goal.durationDays} days` : null}
                {goal.durationDays > 0 && goal.durationHours > 0 ? ' and ' : null}
                {goal.durationHours === 1 ? '1 hour' : goal.durationHours > 1 ? `${goal.durationHours} hours` : null}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Total Staked</span>
                <span>{goal.currentDeposits} AVAX</span>
              </div>
              <div className="relative pt-6 mb-4 w-full">
                <div className="overflow-hidden h-1 text-xs flex rounded-full bg-gray-700">
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <span>Remaining Time to Join</span>
                <span>
                  {goal.RemaingHours > 1 ? `${goal.RemaingHours} hours` : null}
                  {goal.RemaingHours === 1 ? `${goal.RemaingHours} hour` : null}
                  {goal.RemaingHours > 0 && goal.RemaingMinutes > 0 ? ' and ' : null}
                  {goal.RemaingMinutes > 0 ? `${goal.RemaingMinutes} minutes` : null}
                </span>
              </div>
            </div>
          </div>
          <div>
            {showViewButton && (
              <button
                onClick={handleViewGoal}
                className={`text-white w-full py-2 rounded-full hover:bg-opacity-80 transition duration-200 mt-auto border border-gray-700 shadow-lg ${goal.activeButtonColour}`}>
                View Goals
              </button>
            )}
            {/*Need to place account created conditional check before showing the button.*/}
            {showJoinButton && ( 
              <button
                onClick={() => setIsFlipped(true)}
                className={`text-white w-full py-2 rounded-full hover:bg-opacity-80 transition duration-200 mt-auto border border-gray-700 shadow-lg ${goal.activeButtonColour} mt-2`}>
                Join Goal
              </button>
            )}
          </div>
        </div>
        <div className="flip-card-back flex flex-col justify-between h-full white-glassmorphism p-6 mx-10 my-4 cursor-pointer hover:shadow-xl rounded-lg border border-gray-700 w-full max-w-sm">
          {/* Back Card Content */}
          <div className="flex justify-between items-center w-full mb-4">
            <span className={`text-sm font-semibold px-5 py-2 rounded-full text-white border border-gray-700 shadow-lg ${goal.iconColor}`}>{goal.category}</span>
              <div className={`w-10 h-10 rounded-full flex justify-center items-center border border-gray-700 ${goal.iconColor}`}>
                  {typeof goal.icon === 'string' ? (<img src={goal.icon} alt="icon" className="w-full h-full" />) : (goal.icon)}
              </div>
          </div>
        
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter an amount to stake"
                className="w-full mt-20 mb-20 p-2 rounded-full border border-gray-700 text-center"
              />
              <button
                onClick={handleJoinGoal}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`text-white w-full py-2 rounded-full hover:bg-opacity-80 transition duration-200 border border-gray-700 shadow-lg ${goal.activeButtonColour} mt-2`}>
                Confirm
              </button>
            </>
          )}
          <button
            onClick={() => setIsFlipped(false)}
            className={`text-white w-full py-2 rounded-full hover:bg-opacity-80 transition duration-200 mt-2 border border-gray-700 shadow-lg ${goal.nonActiveButtonColour} mt-2`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
