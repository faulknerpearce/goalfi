import React from 'react';

const UserGoalCard = ({ goal, showClaimButton, showFetchButton, Claim }) => {

  const handleClaimRewards = () => {
    // Implement claim rewards logic here
  };

  const isGoalClosed = goal.hours < 0 && goal.minutes < 0;

  return (
    <div className="flex flex-col justify-between h-full white-glassmorphism p-6 mx-10 my-4 cursor-pointer hover:shadow-xl rounded-lg border border-gray-700 w-full max-w-sm">
      <div>
        <div className="flex justify-between items-center w-full mb-4">
          <span className={`text-sm font-semibold px-5 py-2 rounded-full text-white border border-gray-700 shadow-lg ${goal.iconColor}`}>{goal.category}</span>
          <div className={`w-10 h-10 rounded-full flex justify-center items-center border border-gray-700 ${goal.iconColor}`}>
            {typeof goal.icon === 'string' ? (
              <img src={goal.icon} alt="icon" className="w-full h-full" />
            ) : (
              goal.icon
            )}
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
            <span>{goal.startTimestamp} Days</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Total Staked</span>
            <span>{goal.currentDeposits} AVAX</span>
          </div>
          <div className="relative pt-6 mb-4 w-full">
            <div className="overflow-hidden h-1 text-xs flex rounded-full bg-gray-700">
            </div>
          </div>
          {!isGoalClosed && (
            <div className="flex justify-between mb-4">
              <span>Remaining Time</span>
              <span>
                {goal.hours > 1 ? `${goal.hours} hours` : null}
                {goal.hours === 1 ? `${goal.hours} hour` : null}
                {goal.hours > 0 && goal.minutes > 0 ? ' and ' : null}
                {goal.minutes > 0 ? `${goal.minutes} minutes` : null}
              </span>
            </div>
          )}
          {isGoalClosed && (
            <div className="flex justify-center mb-2 text-white text-xl">
              Goal Closed
            </div>
          )}
        </div>
      </div>
      <div>
        {showClaimButton && (
          <button
            onClick={handleClaimRewards}
            className={`text-white w-full py-2 rounded-full hover:bg-opacity-80 transition duration-200 mt-auto border border-gray-700 shadow-lg ${goal.buttonColour}`}>
            Claim Rewards
          </button>
        )}
      </div>
    </div>
  );
};

export default UserGoalCard;
