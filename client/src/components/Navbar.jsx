import React, { useContext, useState, useEffect } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from 'react-router-dom';
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import logo from "../../images/logo.png";
import Modal from "./Modal";

//Component for individual navigation items.
const NavBarItem = ({ title, to, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>
    <Link to={to}>{title}</Link>
  </li>
);

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const { currentAccount, connectWallet, isUserCreated, createUser, isStravaAuthorized, getUserId} = useContext(TransactionContext);
  const [showModal, setShowModal] = useState(false);
  const [isCodeFetched, setIsCodeFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Function to handle connecting to Strava for authorization.
  const handleStravaConnect = async () => {
    try {
      const response = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/GetUrl');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
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
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code'); 

    if (authCode && currentAccount && !isCodeFetched) {
      try {
        const userId = await getUserId(currentAccount);
        setIsCodeFetched(true);

        // Call RequestToken API
        const RequestTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/RequestToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Code: authCode
          }),
        });

        const responseData = await RequestTokenResponse.json();
        
        if (RequestTokenResponse.ok) {
          const { access_token, refresh_token, expires_at } = responseData.data;

          // Save the tokens and other details to DynamoDB using the Lambda function
          const saveTokenResponse = await fetch('https://yamhku5op7.execute-api.us-east-1.amazonaws.com/dev/SaveToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: currentAccount,
              Id: userId,  
              stravaAccessToken: access_token,
              stravaRefreshToken: refresh_token,
              expiresAt: expires_at,
            }),
          });

          const saveResponseData = await saveTokenResponse.json();
          
          if (saveTokenResponse.ok) {
            console.log('Successfully saved to DataBase.');
          } else {
            console.error('Error saving to DynamoDB:', saveResponseData);
          }
          
        } else {
          console.error('Error response from RequestToken API:', responseData);
        }
      } catch (error) {
        console.error('Error handling redirect:', error.message);
      }
    }
  };

  if (!isCodeFetched) {
    handleRedirect(); // Call the async function only if the code hasn't been fetched yet
  }
}, [ currentAccount, getUserId, isCodeFetched ]);

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
    const userCreated = await createUser();

    if (!userCreated) {
      setErrorMessage('Your wallet balance is below the minimum required balance of 0.01 AVAX.');
    } else {
      setShowModal(false); 
      setErrorMessage('');
    }
  };;

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4">
      <div className="md:flex-[0.5] flex-initial justify-center items-center">
        <Link to="/">
          <img src={logo} alt="logo" className="w-32 cursor-pointer" />
        </Link>
      </div>
      <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
        {["Discover", "Dashboard", "About"].map((item, index) => (
          <NavBarItem key={item + index} title={item} to={`/${item.toLowerCase()}`} />
        ))}
        {!currentAccount ? (
          <li className="py-2 px-7 mx-4 rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={connectWallet}>
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
            {isUserCreated && !isStravaAuthorized && (
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
              {isUserCreated && !isStravaAuthorized &&(
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
