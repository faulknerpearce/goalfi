import React from "react";
import { FaPersonRunning } from "react-icons/fa6";
import { FaChartBar } from "react-icons/fa6";
import { FaBook } from "react-icons/fa6";

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
          color="bg-[#2952E3]"
          title="Exercise"
          icon={<FaPersonRunning fontSize={21} className="text-white" />}
          subtitle="Join activities in the exercise pools including: running, walking, and cycling and earn when you burn!"
        />
        <ServiceCard
          color="bg-[#8945F8]"
          title="Learning"
          icon={<FaBook fontSize={21} className="text-white" />}
          subtitle="Explore activities in the learning pools for various educational activities."
        />
        <ServiceCard
          color="bg-[#F84550]"
          title="Productivity"
          icon={<FaChartBar fontSize={21} className="text-white" />}
          subtitle="Explore activities in the productivity pools for various productivity tasks."
        />
      </div>
    </div>
  </div>
);

export default Services;
