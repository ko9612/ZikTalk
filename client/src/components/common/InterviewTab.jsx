import React from "react";
import Button from "./Button";
import { useInterviewTabStore } from "@/store/store";

const InterviewTab = () => {
  const tabs = ["설정", "사전 체크", "모의 면접", "응시 완료"];
  const tabSelect = useInterviewTabStore((state) => state.tabSelect);

  return (
    <div className="bg-zik-border/50 mx-auto flex h-[4rem] w-full justify-center">
      <div className="text-zik-text flex w-full max-w-[1200px] items-center justify-between gap-6 px-6 text-[20px] font-medium xl:px-0">
        {tabs.map((tab, index) => (
          <li key={tab} className="flex w-full">
            <div
              key={tab}
              className={`text-nowrap ${tabSelect === tab ? "text-zik-text font-bold" : "text-zik-text/50"}`}
            >
              {tab}
            </div>
            {index < tabs.length - 1 && (
              <i className="text-zik-text/50 mx-auto text-center">···</i>
            )}
          </li>
        ))}
        <Button className="text-nowrap">나가기</Button>
      </div>
    </div>
  );
};

export default InterviewTab;
