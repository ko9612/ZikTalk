import React from "react";
import Button from "./Button";

const InterviewTab = ({
  activeTab = "설정", // 첫 번째 탭의 값으로 기본값 설정
  onTabChange = () => {}, // 빈 함수로 설정
}) => {
  const tabs = ["설정", "사전 체크", "모의 면접", "응시 완료"];

  return (
    <div className="bg-zik-border/50 m-0 items-center px-6 py-3">
      <ul className="text-zik-text m-0 flex list-none items-center justify-around gap-6 p-0 text-[20px] font-medium">
        {tabs.map((tab, index) => (
          <>
            <li
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`${activeTab === tab ? "text-zik-text" : "text-zik-text/50"}`}
            >
              {tab}
            </li>
            {index < tabs.length - 1 && (
              <li className="text-zik-text/50">···</li>
            )}
          </>
        ))}
        <li>
          <Button>나가기</Button>
        </li>
      </ul>
    </div>
  );
};

export default InterviewTab;
