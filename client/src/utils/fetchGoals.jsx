import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";
import { FaRunning, FaBiking, FaWalking } from "react-icons/fa";

// Function to calculate the remaining time until a given goal expires.
function calculateRemainingTime(timestamp) {
  const currentTime = new Date();
  const expiryTime = new Date(Number(timestamp) * 1000);

  const timeDifferenceInMilliseconds = expiryTime - currentTime;
  const timeDifferenceInHours = Math.floor(timeDifferenceInMilliseconds / 3600000);
  const timeDifferenceInMinutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);

  return {
    hours: timeDifferenceInHours,
    minutes: timeDifferenceInMinutes
  };
}
// Function to calculate the remaining time until a goal can no longer be joined.
function calculateRemainingTimeToJoin(startTimestamp) {
  
  const startTime = new Date(Number(startTimestamp) * 1000);
  const currentTimestamp = new Date().getTime();

  const timeDifferenceInMilliseconds = startTime - currentTimestamp;

  const timeDifferenceInHours = Math.floor(timeDifferenceInMilliseconds / 3600000);
  const timeDifferenceInMinutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);
  
  return {
    RemaingHours: timeDifferenceInHours,
    RemaingMinutes: timeDifferenceInMinutes
  };
  
}

// Function to calculate the duration of a goal in days and hours.
function calculateGoalDuration(startTimestamp, expiryTimestamp) {
  const startTime = new Date(Number(startTimestamp) * 1000);
  const expiryTime = new Date(Number(expiryTimestamp) * 1000);

  const timeDifferenceInMilliseconds = expiryTime - startTime;
  const timeDifferenceInDays = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));
  const timeDifferenceInHours = Math.floor((timeDifferenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    days: timeDifferenceInDays,
    hours: timeDifferenceInHours
  };
}

// Function to map activity types to corresponding icons and colors.
const getIconAndColor = (activity) => {
  switch (activity) {
    case "RUNNING":
      return {
        stravaAPICall: 'Run',
        iconColor: "bg-[#2952E3]",
        icon: <FaRunning fontSize={21} className="text-white" />,
      };
    case "CYCLING":
      return {
        stravaAPICall: 'Ride',
        iconColor: "bg-[#298150]",
        icon: <FaBiking fontSize={21} className="text-white" />,
      };
    case "WALKING":
      return {
        stravaAPICall: 'Walk',
        iconColor: "bg-[#F84550]",
        icon: <FaWalking fontSize={21} className="text-white" />,
      };
    default:
      return {
        stravaAPICall: null,
        iconColor: "bg-gray-500",
        icon: <FaRunning fontSize={21} className="text-white" />,
      };
  }
};

// Function to fetch goals from the blockchain and format the data for display.
export const fetchGoals = async (provider, getExpired) => {
  const currentTimestamp = Math.floor(Date.now() / 1000); 
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const goalCount = await contract.goalCount();
  const fetchedGoals = [];

  for (let i = 0; i < goalCount; i++) {
    const goal = await contract.goals(i);
    const participantAddresses = await contract.getParticipantAddresses(i);

    const { iconColor, icon, stravaAPICall } = getIconAndColor(goal.activity);
    
    const goalDuration = calculateGoalDuration(goal.startTimestamp, goal.expiryTimestamp);
    const remainingTime = calculateRemainingTime(goal.expiryTimestamp);
    const remainingTimeToJoin = calculateRemainingTimeToJoin(goal.startTimestamp)

    const isActive = goal.startTimestamp > currentTimestamp; // Determine if the goal is active.
    const includeGoal = getExpired ? !isActive : isActive; // Include the goal based on its status and the filter.

    if (includeGoal) {
      fetchedGoals.push({
        id: i,
        category: goal.activity,
        title: goal.description,
        distance: Number(goal.distance),
        currentDeposits: ethers.formatUnits(goal.stake, 'ether'), // Format stake to Ether units.
        colour: "bg-orange-700",
        activeButtonColour:"bg-orange-600",
        nonActiveButtonColour:'bg-gray-500',
        iconColor,
        icon,
        durationDays: goalDuration.days,
        durationHours: goalDuration.hours,
        hours: remainingTime.hours,
        minutes: remainingTime.minutes,
        RemaingHours: remainingTimeToJoin.RemaingHours,
        RemaingMinutes: remainingTimeToJoin.RemaingMinutes,
        startTimestamp: String(goal.startTimestamp),
        expiryTimestamp: String(goal.expiryTimestamp),
        participants: participantAddresses.length,
        participantAddresses,
        stravaAPICall
      });
    }
  }

  return fetchedGoals; // Return the list of formatted goals.
};
