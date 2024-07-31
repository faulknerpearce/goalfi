import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";
import { FaRunning, FaBiking, FaWalking } from "react-icons/fa";

function convertTimeToHoursAndMinutes(timestamp) {
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
    const remainingTime = convertTimeToHoursAndMinutes(goal.expiryTimestamp);

    const isActive = goal.expiryTimestamp > currentTimestamp;
    const includeGoal = getExpired ? !isActive : isActive;

    if (includeGoal) {
      fetchedGoals.push({
        id: i,
        category: goal.activity,
        title: goal.description,
        currentDeposits: ethers.formatUnits(goal.stake, 'ether'),
        colour: "bg-orange-700",
        buttonColour:"bg-orange-600",
        failedButtonColour:'bg-gray-500',
        claimedButtonColour: 'bg-gray-500',
        iconColor,
        icon,
        durationDays: goalDuration.days,
        durationHours: goalDuration.hours,
        hours: remainingTime.hours,
        minutes: remainingTime.minutes,
        participants: participantAddresses.length,
        participantAddresses,
        stravaAPICall
      });
    }
  }

  return fetchedGoals;
};
