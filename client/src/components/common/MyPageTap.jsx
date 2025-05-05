import React, { useState } from "react";

const tabs = ["분석결과 리스트", "질문 북마크", "내 정보 관리"];

const MyPageTab = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="border-b border-gray-300 bg-white">
      <div className="flex space-x-8 px-6 py-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm transition-colors ${
              activeTab === tab ? "font-bold text-black" : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyPageTab;
