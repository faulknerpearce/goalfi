import { createContext, useContext, useState } from "react";
import { supabase } from "../providers/supabase.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Fetches Strava token for a given wallet address
export async function fetchStravaToken(walletAddress) {

  const { data, error } = await supabase
    .from('access_tokens')
    .select('access_token')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error) {
    // Handle "no rows found" as expected, not an error
    if (error.code === 'PGRST116') {
      console.log('No Strava token found for wallet address:', walletAddress);
      return null;
    }
    console.error('Error fetching Strava token:', error);
    return null;
  }

  return data ? data.access_token : null;
}

export const UserProvider = ({ children }) => {
  const [isStravaAuthorized, setIsStravaAuthorized] = useState(false);

  // ============ Strava Authorization Functions ============

  // Checks if the user is authorized with Strava (checks cookie first, then database)
  const checkStravaAuthorization = async (walletAddress) => {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('access_token')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error) {
      // Handle "no rows found" as expected, not an error
      if (error.code === 'PGRST116') {
        console.log('No Strava token found for wallet address:', walletAddress);
        return false;
      }
      console.error('Error checking Strava authorization:', error);
      return false;
    }

    return data && data.access_token ? true : false;
  };

  // ============ Strava Token Management Functions ============

  // Fetches tokens for all participants of a goal
  const fetchParticipantsTokens = async (participantAddresses) => {
    const participantTokens = {};

    // Fetch tokens for all participants
    await Promise.all(participantAddresses.map(async (address) => {
      try {
        const token = await fetchStravaToken(address); // token is the accessToken string
        if (token) {
          participantTokens[address] = token;
        }
      } catch (error) {
        console.error(`Error fetching token for address: ${address}`, error);
      }
    }));
    return participantTokens;
  };

  // Request Strava authorization URL from the API
  const getStravaAuthUrl = async () => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/get-strava-auth-url`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        }
      });
      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('Error fetching authorization URL:', error.message);
      return null;
    }
  };

  // Request access token from Strava using authorization code
  const requestStravaToken = async (authCode) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/request-strava-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({
          Code: authCode
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        return responseData.data;
      } else {
        console.error('Error response from RequestToken API:', responseData);
        return null;
      }
    } catch (error) {
      console.error('Error requesting token:', error.message);
      return null;
    }
  };

  // Save Strava tokens to database
  const saveStravaToken = async (walletAddress, accessToken, refreshToken, expiresAt) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/save-strava-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
          stravaAccessToken: accessToken,
          stravaRefreshToken: refreshToken,
          expiresAt: expiresAt,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Successfully saved to Database.');
        return true;
      } else {
        console.error('Error saving to Supabase:', responseData);
        return false;
      }
    } catch (error) {
      console.error('Error saving token:', error.message);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{
      isStravaAuthorized,
      setIsStravaAuthorized,
      checkStravaAuthorization,
      fetchParticipantsTokens,
      getStravaAuthUrl,
      requestStravaToken,
      saveStravaToken,
    }}>
      {children}
    </UserContext.Provider>
  );
};
