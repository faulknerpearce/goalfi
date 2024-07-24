import React from "react";

const DashboardCard = ({ title, value, icon, height, className }) => (
  <div className={`flex flex-row justify-between items-center white-glassmorphism p-3 cursor-pointer hover:shadow-xl rounded-lg border border-gray-700 ${height} ${className}`}>
    <div className="flex flex-col flex-1">
      <h3 className="mt-2 text-white text-lg">{title}</h3>
      <p className="mt-1 text-white text-sm md:w-9/12">
        {value}
      </p>
    </div>
    <div className={`w-10 h-10 rounded-full flex justify-center items-center bg-blue-500`}>
      {icon}
    </div>
  </div>
);

export default DashboardCard;
