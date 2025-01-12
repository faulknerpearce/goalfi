import React from "react";
import { FaRunning, FaBiking, FaWalking } from "react-icons/fa";

const ServiceCard = ({ color, title, icon, subtitle }) => (
  <div
    className="flex flex-col justify-center items-center white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl"
    style={{ width: '350px', height: '220px' }} // Adjust width and height here
  >
    <div className={`w-12 h-12 rounded-full flex justify-center items-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="flex flex-col flex-1 items-center text-center">
      <h3 className="mt-2 text-white text-2xl">{title}</h3>
      <p className="mt-4 text-white text-sm md:w-9/12">
        {subtitle}
      </p>
    </div>
  </div>
);

const Services = () => (
  <div className="flex w-full justify-center items-center">
    <div className="flex flex-col items-center justify-between md:p-20 py-12 px-4">
      <div className="flex flex-col justify-start items-start mb-10">
        <h1 className="text-white text-3xl sm:text-5xl py-2 text-gradient" style={{ lineHeight: '1.2' }}>
          Goals By Category
        </h1>
      </div>

      <div className="flex justify-center items-center flex-wrap gap-6">
        <ServiceCard
          color="bg-[#F84550]"
          title="Walking"
          icon={<FaWalking fontSize={21} className="text-white" />}
          subtitle="Stay active with walking goals. Track your steps and earn rewards for staying consistent."
        />
        <ServiceCard
          color="bg-[#2952E3]"
          title="Running"
          icon={<FaRunning fontSize={21} className="text-white" />}
          subtitle="Take on running challenges. Push your limits and get rewarded for every kilometer."
        />
        <ServiceCard
          color="bg-[#298150]"
          title="Cycling"
          icon={<FaBiking fontSize={21} className="text-white" />}
          subtitle="Join cycling goals to boost fitness. Track your rides and achieve more."
        />
      </div>
    </div>
  </div>
);

export default Services;
