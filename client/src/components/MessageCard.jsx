import React from "react";

const MessageCard = ({ color, icon, message }) => (
  <div
    className="flex flex-col justify-center items-center white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl"
    style={{ width: '300px', height: '200px' }}
  >
    <div className={`w-12 h-12 rounded-full flex justify-center items-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="flex flex-col flex-1 items-center text-center">
      <p className="mt-4 text-white text-lg md:w-9/12">
        {message}
      </p>
    </div>
  </div>
);

export default MessageCard;