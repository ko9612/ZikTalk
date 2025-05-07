import React from "react";
import Button from "./Button";

const InterviewTab = ({
  activeTab = "설정", // 첫 번째 탭의 값으로 기본값 설정
  onTabChange = () => {}, // 빈 함수로 설정
}) => {
  const tabs = ["설정", "사전 체크", "모의 면접", "응시 완료"];

  return (
    <div className="bg-zik-border/50 mx-auto flex h-[4rem] w-full justify-center">
      <ul className="text-zik-text m-0 flex w-full max-w-[1200px] list-none items-center justify-between gap-6 px-6 text-[20px] font-medium xl:px-0">
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
