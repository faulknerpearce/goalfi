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
  
export const fetchGoals = async (provider) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const goalCount = await contract.goalCount();
    const fetchedGoals = [];
  
    for (let i = 0; i < goalCount; i++) {
      const goal = await contract.goals(i);
      
      if (goal.expiryTimestamp > currentTimestamp && fetchedGoals.length < 3){
        const participantAddresses = await contract.getParticipantAddresses(i); 
        const { iconColor, icon, stravaAPICall } = getIconAndColor(goal.activity);
  
        console.log("Goal fetched:", goal);
        console.log("Strava API Call:", stravaAPICall);

        const remainingTime = convertTimeToHoursAndMinutes(goal.expiryTimestamp); // chage to start timestamp
  
        fetchedGoals.push({
          id: i,
          category: goal.activity,
          title: goal.description,
          currentDeposits: ethers.formatUnits(goal.stake, 'ether'),
          colour: "bg-blue-500",
          iconColor,
          icon,
          hours: remainingTime.hours,
          minutes: remainingTime.minutes,
          participants: participantAddresses.length, 
          participantAddresses, // Store the actual addresses for further use if needed
          stravaAPICall // convert running to run, walking to walk, cycling to ride for the strava api call.
        });
      }
    }
  
    return fetchedGoals;
  };