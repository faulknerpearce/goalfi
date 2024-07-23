import React from "react";
import Loader from "./Loader"; 

const Modal = ({ show, handleClose, handleConfirm, errorMessage, loading }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center ${show ? 'block' : 'hidden'} z-50`}>
      <div className="bg-black bg-opacity-50 fixed inset-0 z-40"></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-50 max-w-lg w-full">
        <h2 className="text-2xl mb-4">Create Account</h2>
        <p className="mb-4">To create an account and participate in the goal pools, we need to ensure that you have a minimum of 0.01 AVAX in your wallet. This helps us prevent users from creating accounts with empty balances.</p>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
        <div className="flex justify-end">
          <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={handleClose} disabled={loading}>Cancel</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleConfirm} disabled={loading}>Agree</button>
        </div>
        {loading && <Loader />} 
      </div>
    </div>
  );
};

export default Modal;
