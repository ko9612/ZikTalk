import React, { useEffect } from "react";
import Button from "@/components/common/Button";
import Pencil from "@/assets/images/pencil.svg";
import Task2 from "@/assets/images/task2.png";
import Timebulb from "@/assets/images/time-bulb.webp";
import Interactivesession from "@/assets/images/interactive-session.png";
import Minus from "@/assets/images/minus.svg";
import Plus from "@/assets/images/plus.svg";

import { useInterviewTabStore, useSetupNavigationStore } from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";

const listWrap =
  "flex flex-1 min-w-0 flex-row justify-start gap-4 md:flex-col items-center md:justify-start";
const imageWrap =
  "w-[clamp(60px,15vw,150px)] h-[clamp(60px,15vw,150px)] bg-[#ECEBFF] rounded-[50%] flex items-center justify-center border-[4px] border-zik-main/50";
const textWrap =
  "md:mt-7 flex flex-col items-center justify-center flex items-start md:items-center whitespace-nowrap text-lg text-zik-text";

const PreCheckStep = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { navigateTo } = useSetupNavigationStore((state) => state);

  useEffect(() => {
    const images = [Timebulb, Interactivesession, Task2];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    setTabSelect("사전 체크");
  }, []);

  const handlePrevious = () => {
    navigateTo("RoleSetup");
    setTabSelect("설정");
  };

  const handleNext = () => {
    navigateTo("InterviewSection");
    setTabSelect("모의 면접");
  };

  const { qCount, setQCount } = useInterviewStore();

  const decrease = () => {
    if (qCount > 1) setQCount(qCount - 1);
  };

  const increase = () => {
    if (qCount < 10) setQCount(qCount + 1);
  };
  return (
    <div
      className="mx-auto flex w-full flex-col items-center justify-center px-4 py-8"
      style={{ height: "calc(100vh - 18rem)" }}
    >
      <div className="text-zik-text mt-9 mb-8 text-2xl font-bold 2xl:mt-18">
        사전 체크
      </div>

      <div className="flex items-center justify-center">
        <img src={Pencil} alt="연필"></img>
        <div className="text-zik-main px-2 text-sm font-bold 2xl:text-base">
          문항 수는 1개부터 최대 10개까지 자유롭게 변경할 수 있어요
        </div>
      </div>

      <div className="mt-12 flex w-full justify-center 2xl:mt-24">
        <ul className="flex-start flex flex-col justify-center gap-[clamp(40px,8vw,240px)] md:flex-row">
          <li className={listWrap}>
            <div className={imageWrap}>
              <img
                loading="eager"
                src={Task2}
                alt="문항"
                className={`w-20 translate-x-1 -translate-y-1.5`}
              />
            </div>
            <div className={textWrap}>
              <strong>문항수</strong>
              <div className="flex">
                <img
                  src={Minus}
                  alt="-"
                  className="cursor-pointer"
                  onClick={decrease}
                />
                <p className="text-zik-main w-20 text-center text-xl font-bold 2xl:text-2xl">
                  <span className="underline">{qCount}</span>개
                </p>
                <img
                  src={Plus}
                  alt="+"
                  className="cursor-pointer"
                  onClick={increase}
                />
              </div>
            </div>
          </li>
          <li className={listWrap}>
            <div className={imageWrap}>
              <img
                loading="eager"
                src={Timebulb}
                alt="준비시간"
                className="w-20"
              />
            </div>
            <div className={textWrap}>
              <strong>답변 준비 시간</strong>
              <p className="text-xl font-bold text-gray-600/80 2xl:text-2xl">
                30초
              </p>
            </div>
          </li>
          <li className={listWrap}>
            <div className={imageWrap}>
              <img
                loading="eager"
                src={Interactivesession}
                alt="답변"
                className="w-20"
              />
            </div>
            <div className={textWrap}>
              <strong>대답시간</strong>
              <p className="text-zik-text text-xl font-bold 2xl:text-2xl">
                2분
              </p>
            </div>
          </li>
        </ul>
      </div>
      <div className="absolute bottom-10 flex justify-center gap-15">
        <Button color="gray" onClick={handlePrevious}>
          이전
        </Button>
        <Button onClick={handleNext}>다음</Button>
      </div>
    </div>
  );
};

export default PreCheckStep;
