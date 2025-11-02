import { useState, useEffect } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from 'react-router-dom';
import { useGoalfi } from "../context/web3/goalfiContext.jsx";
import { useWallet } from "../context/web3/walletContext.jsx";
import { useUser } from "../context/database/userContext.jsx";
import logo from "../../images/logo.png";
import Modal from "./Modal.jsx";

//Component for individual navigation items.
const NavBarItem = ({ title, to, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>
    <Link to={to}>{title}</Link>
  </li>
);

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const { createUser, checkUserExists } = useGoalfi();
  const { currentAccount, connectWallet, isUserCreated, shortenAddress } = useWallet();
  const { isStravaAuthorized, setIsStravaAuthorized, getStravaAuthUrl, requestStravaToken, saveStravaToken, checkStravaAuthorization } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [isCodeFetched, setIsCodeFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTokenSaved, setIsTokenSaved] = useState(() => {
    return localStorage.getItem('stravaTokenSaved') === 'true';
  });

  // Function to handle connecting to Strava for authorization.
  const handleStravaConnect = async () => {
    try {
      const authUrl = await getStravaAuthUrl();
      if (authUrl) {
        globalThis.location.href = authUrl;
      } else {
        console.error('Failed to generate authorization URL');
      }
    } catch (error) {
      console.error('Error fetching authorization URL:', error.message);
    }
  };

  // Effect hook to handle redirection and token exchange after Strava authorization.
  useEffect(() => {
    const handleRedirect = async () => {
      const urlParams = new URLSearchParams(globalThis.location.search);
      const authCode = urlParams.get('code'); 

      if (authCode && currentAccount && !isCodeFetched) {
        try {
          setIsCodeFetched(true);

          // Request token from Strava
          const tokenData = await requestStravaToken(authCode);
          console.log('Received token data from Strava:', tokenData);

          if (tokenData) {
          
            // Save the tokens to database
            const saved = await saveStravaToken(
              currentAccount,
              tokenData.accessToken,
              tokenData.refreshToken,
              tokenData.expiresAt
            );

            if (saved) {
              console.log('Successfully saved to DataBase.');
              setIsTokenSaved(true);
              localStorage.setItem('stravaTokenSaved', 'true');
            }
          }
        } catch (error) {
          console.error('Error handling redirect:', error.message);
        }
      }
    };

    if (!isCodeFetched) {
      handleRedirect();
    }
  }, [currentAccount, isCodeFetched]);

  // Function to show the modal for account creation.
  const handleCreateAccountClick = () => {
    setShowModal(true);
  };

  // Function to close the modal.
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to confirm account creation and close the modal if successful.
  const handleConfirmModal = async () => {
    try {
      // First check if user already exists on the smart contract
      const userExists = await checkUserExists(currentAccount);
      
      if (userExists) {
        // User already exists on-chain
        setErrorMessage('Your wallet is already verified on the smart contract.');
        return;
      }

      // User doesn't exist, so create them
      const userCreated = await createUser();

      if (!userCreated) {
        setErrorMessage('Your wallet balance is below the minimum required balance of 0.01 AVAX.');
      } else {
        setShowModal(false); 
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error verifying/creating user:', error);
      setErrorMessage('Failed to verify wallet. Please try again.');
    }
  };

  const handleConnectWallet = () => {
    connectWallet();
  };

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4">
      <div className="md:flex-[0.5] flex-initial justify-center items-center">
        <Link to="/">
          <img src={logo} alt="logo" style={{ width: '200px', height: 'auto' }} className="cursor-pointer" />
        </Link>
      </div>
      <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
        {["Discover", "Dashboard", "About"].map((item, index) => (
          <NavBarItem key={item + index} title={item} to={`/${item.toLowerCase()}`} />
        ))}
        {!currentAccount ? (
          <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={handleConnectWallet}>
            Connect Wallet
          </li>
        ) : (
          <>
            <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-gray-500 hover:bg-gray-600">
              {shortenAddress(currentAccount)}
            </li>
            {!isUserCreated && (
              <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={handleCreateAccountClick}>
                Verify Wallet
              </li>
            )}
            {isUserCreated && !isStravaAuthorized && !isTokenSaved && (
              <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={handleStravaConnect}>
                Connect to Strava
              </li>
            )}
          </>
        )}
      </ul>
      <div className="flex relative">
        {!toggleMenu && (
          <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(true)} />
        )}
        {toggleMenu && (
          <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(false)} />
        )}
        {toggleMenu && (
        <ul
          className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
          flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in"
        >
          <li className="text-xl w-full my-2"><AiOutlineClose onClick={() => setToggleMenu(false)} /></li>

          {/* Move Wallet/Account related buttons to the top */}
          {!currentAccount ? (
            <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={connectWallet}>
              Connect Wallet
            </li>
          ) : (
            <>
              <li className="py-2 px-7 mx-4 mb-2 rounded-full cursor-pointer bg-gray-500 hover:bg-gray-600">
                {shortenAddress(currentAccount)}
              </li>
              {!isUserCreated && (
                <li className="py-2 px-7 mx-4 mb-2 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={handleCreateAccountClick}>
                  Verify Wallet
                </li>
              )}
              {isUserCreated && !isStravaAuthorized && !isTokenSaved && (
                <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={handleStravaConnect}>
                  Connect to Strava
                </li>
              )}
            </>
          )}

          {/* Navigation items moved below the wallet/account buttons */}
          {["Discover", "Dashboard", "About"].map(
            (item, index) => <NavBarItem key={item + index} title={item} to={`/${item.toLowerCase()}`} classprops="my-2 text-lg" />,
          )}
        </ul>
      )}
      </div>
      <Modal show={showModal} handleClose={handleCloseModal} handleConfirm={handleConfirmModal} errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
    </nav>
  );
};

export default Navbar;
