import React from "react";
import { TabsProps } from "@/types/class";

export const ClassTabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, classesData }) => {
  const tabs = Object.keys(classesData);
  return (
    <div className="flex flex-col sm:flex-row border-b mb-4 text-gray-700 font-medium">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`
            py-2 px-4 w-full sm:w-auto text-left transition-all duration-200
            ${activeTab === tab ? "bg-secondary text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}
            ${i < tabs.length - 1 ? "mb-2 sm:mb-0 sm:mr-2" : ""}
          `}
        >
          {tab} ({classesData[tab]?.length || 0})
        </button>
      ))}
    </div>
  );
}; 