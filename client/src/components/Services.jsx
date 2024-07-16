import React from "react";
import { FaPersonRunning } from "react-icons/fa6";
import { FaChartBar } from "react-icons/fa6";
import { FaBook } from "react-icons/fa6";

const ServiceCard = ({ color, title, icon, subtitle }) => (
  <div className="flex flex-row justify-between items-center white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl w-300 h-50 z-10"> {/* Fixed size */}
    <div className="flex flex-col flex-1">
      <h3 className="mt-2 text-white text-lg">{title}</h3>
      <p className="mt-1 text-white text-sm md:w-9/12">
        {subtitle}
      </p>
    </div>
    <div className={`w-10 h-10 rounded-full flex justify-center items-center ${color}`}>
      {icon}
    </div>
  </div>
);

const Services = () => (
  <div className="flex w-full justify-center items-center">
    <div className="flex mf:flex-row flex-col items-center justify-between md:p-20 py-12 px-4">
      <div className="flex-1 flex flex-col justify-start items-start">
        <h1 className="text-white text-3xl sm:text-5xl py-2 text-gradient" style={{ lineHeight: '1.2' }}>
            Most popular
          <br/>
            Goal Pools
        </h1>
        <p className="text-left my-2 text-white font-light md:w-9/12 w-11/12 text-base">
          Exlpore our goal pools by category 
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-start items-center">
        <ServiceCard
          color="bg-[#2952E3]"
          title="Exercise"
          icon={<FaPersonRunning fontSize={21} className="text-white" />}
          subtitle="Expolre activites in the exercice pools including: runnning walking and cyclinig"
        />
        <ServiceCard
          color="bg-[#8945F8]"
          title="Learning"
          icon={<FaBook fontSize={21} className="text-white" />}
          subtitle="Expolre activites in the exercice pools including: runnning walking and cyclinig:"
        />
        <ServiceCard
          color="bg-[#F84550]"
          title="Productivity"
          icon={<FaChartBar fontSize={21} className="text-white" />}
          subtitle="Expolre activites in the exercice pools including: runnning walking and cyclinig:"
        />
      </div>
    </div>
  </div>
);

export default Services;
