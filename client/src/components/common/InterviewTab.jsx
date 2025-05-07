import React from "react";
import Button from "./Button";
import { useInterviewTabStore } from "@/store/store";

const InterviewTab = () => {
  const tabs = ["설정", "사전 체크", "모의 면접", "응시 완료"];
  const tabSelect = useInterviewTabStore((state) => state.tabSelect);

  return (
    <div className="bg-zik-border/50 mx-auto flex h-[4rem] w-full justify-center">
      <ul className="text-zik-text m-0 flex w-full max-w-[1200px] list-none items-center justify-between gap-6 px-6 text-[20px] font-medium xl:px-0">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab}>
            <li
              className={`${tabSelect === tab ? "text-zik-text font-bold" : "text-zik-text/50"}`}
            >
              {tab}
            </li>
            {index < tabs.length - 1 && (
              <li className="text-zik-text/50">···</li>
            )}
          </React.Fragment>
        ))}
        <li>
          <Button>나가기</Button>
        </li>
      </ul>
    </div>
  );
};

export default InterviewTab;
