import { useState } from "react";
import Loader from "./Loader"; 

const Modal = ({ show, handleClose, handleConfirm, errorMessage }) => {
  const [loading, setLoading] = useState(false);

  const handleAgreeClick = async () => {
    setLoading(true);
    try {
      await handleConfirm();
    } catch (error) {
      console.error("Error confirming action:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${show ? 'block' : 'hidden'} z-50`}>
      <div className="bg-black bg-opacity-50 fixed inset-0 z-40"></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-50 max-w-lg w-full">
        <h2 className="text-2xl mb-4">Create Account</h2>
        <p className="mb-4">
          To participate in goals, you need to link your wallet to the smart contract. 
          this will also verify that you have a minimum of 0.01 AVAX in your wallet. 
          No funds will the withdrawn, the only cost is the transaction fee.</p>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
        {loading && <Loader />} 
        <div className="flex justify-end">
          <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={handleClose} disabled={loading}>Cancel</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAgreeClick} disabled={loading}>Agree</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
