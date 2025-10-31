import { useEffect } from 'react';
import { useGoalfi } from './goalfiContext.jsx';
import { useWallet } from './walletContext.jsx';
import { useUser } from '../database/userContext.jsx';

// Component to initialize wallet state with contract and database data
export const WalletInitializer = ({ children }) => {
  const { checkUserExists } = useGoalfi();
  const { currentAccount, setIsUserCreated } = useWallet();
  const { checkStravaAuthorization, setIsStravaAuthorized } = useUser();

  useEffect(() => {
    const initializeWalletState = async () => {
      if (currentAccount) {
        try {
          const userExists = await checkUserExists(currentAccount);
          const stravaAuthorized = await checkStravaAuthorization(currentAccount);
          
          setIsUserCreated(userExists);
          setIsStravaAuthorized(stravaAuthorized);
        } catch (error) {
          console.error("Error initializing wallet state:", error);
        }
      }
    };

    initializeWalletState();
  }, [currentAccount, checkUserExists, checkStravaAuthorization, setIsUserCreated, setIsStravaAuthorized]);

  return children;
};
