import React from 'react';

const GoalCard = ({ goal, joinGoal }) => {

  return (
    <div className="flex flex-col justify-between h-full white-glassmorphism p-6 mx-6 my-4 cursor-pointer hover:shadow-xl rounded-lg border border-gray-700 max-w-md w-lg">
      <div>
        <div className="flex justify-between items-center w-full mb-4">
          <span className={`text-sm font-semibold px-5 py-2 rounded-full text-white border border-gray-700 shadow-lg ${goal.colour}`}>{goal.category}</span>
          <div className={`w-10 h-10 rounded-full flex justify-center items-center border border-gray-700 ${goal.iconColor}`}>
            {typeof goal.icon === 'string' ? (
              <img src={goal.icon} alt="icon" className="w-full h-full" />
            ) : (
              goal.icon
            )}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-8 text-white">{goal.title}</h3>
        <p className="text-gray-300 mb-4">{goal.description}</p>
        <div className="text-sm text-gray-300 w-full">
          <div className="flex justify-between mb-2">
            <span>Participants</span>
            <span>{goal.participants}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Goal Duration</span>
            <span>{goal.startTimestamp}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Total Staked</span>
            <span>{goal.currentDeposits} ETH</span>
          </div>
          <div className="relative pt-6 mb-4 w-full">
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-sky-200">
              <div style={{ width: '35%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sky-500"></div>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <span>Remaining Time</span>
            <span>{goal.expiryTimestamp}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => joinGoal(goal.id)}
        className={`text-white w-full py-2 rounded-full hover:bg-opacity-80 transition duration-200 mt-auto border border-gray-700 shadow-lg ${goal.colour}`}
      >
        Join Goal
      </button>
    </div>
  );
};

export default GoalCard;
