"use client";
import React, { useState } from "react";

const TabPanel = ({ tabs, activeTab, setActiveTab }) => {
  const handleTabClick = (title) => {
    setActiveTab(title);
  };
  return (
    <div className="border-[1px]">
      <div className="bg-gray-100">
        {tabs.map((tab) => (
          <button
            className={`overflow-hidden pt-2 pb-2 pl-4 pr-4 ${
              activeTab === tab.title ? "active bg-white" : "bg-gray-100"
            }`}
            onClick={() => handleTabClick(tab.title)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      {tabs.map((tab) => {
        if (activeTab === tab.title) {
          return <div className="p-4" key={tab.title}>{tab.body}</div>;
        }
        return null;
      })}
    </div>
  );
};

export default TabPanel;
