import React from "react";
import { LifeLine } from "react-loading-indicators";

const LifeLineLoader = ({ color = "#4768ee", size = "medium" }) => {
  return (
    <div className="col-span-full flex justify-center items-center py-14">
      <div className="flex flex-col items-center gap-3">
        <LifeLine color={color} size={size} />
        <p className="text-sm text-gray-400">Loading dashboard stats</p>
      </div>
    </div>
  );
};

export default LifeLineLoader;
