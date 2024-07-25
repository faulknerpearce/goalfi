import React, { useContext, useState } from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from 'react-router-dom';
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import Modal from "./Modal";
import logo from "../../images/logo.png";

const NavBarItem = ({ title, to, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>
    <Link to={to}>{title}</Link>
  </li>
);

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const { currentAccount, connectWallet, isUserCreated, createUser, errorMessage, setErrorMessage,loading } = useContext(TransactionContext);

  const handleCreateAccountClick = () => {
    setShowModal(true);
    setErrorMessage(""); 
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmModal = async () => {
    const userCreated = await createUser();
    if (userCreated) { 
      setShowModal(false);
    }
  };

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
            {["Discover", "Dashboard", "Rewards", "About"].map(
              (item, index) => <NavBarItem key={item + index} title={item} to={`/${item.toLowerCase()}`} classprops="my-2 text-lg" />,
            )}
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
              </>
            )}
          </ul>
        )}
      </div>
      <Modal show={showModal} handleClose={handleCloseModal} handleConfirm={handleConfirmModal} errorMessage={errorMessage} loading={loading} />
    </nav>
  );
};

export default Navbar;
