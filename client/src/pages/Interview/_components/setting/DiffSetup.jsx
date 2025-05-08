import React, { useState, useEffect } from "react";

import checkedCircle from "@/assets/images/checked-circle.svg";
import starFill from "@/assets/images/star-fill.svg";
import starEmpty from "@/assets/images/star-empty.svg";

import Button from "@/components/common/Button";
import clsx from "clsx";
import { useInterviewTabStore, useSetupNavigationStore } from "@/store/store";

const levels = [
  {
    label: "신입",
    description:
      "처음이라도 괜찮아요. 기초 역량과 성장 가능성을 중심으로 묻습니다.\n실무 경험이 없어도 답할 수 있는 질문들로 구성되어 있어요",
    stars: 1,
  },
  {
    label: "경력 1~3년",
    description:
      "짧지만 실무를 경험해본 만큼, 실무 역량과 문제 해결력을 중심으로 확인합니다.\n기초 지식에 더해 실제 프로젝트 경험을 바탕으로 답할 수 있는 질문들로 구성되어 \n있어요",
    stars: 2,
  },
  {
    label: "경력 4~7년",
    description:
      "경험이 쌓인 만큼 기술 선택의 이유, 협업 경험, 아키텍처 이해 등 심화된 질문이 \n포함됩니다.\n문제를 어떻게 바라보고 풀어가는지에 대한 사고 방식도 중요하게 평가해요",
    stars: 3,
  },
  {
    label: "경력 7년 이상",
    description:
      "기술 리더 혹은 아키텍트로서의 시야를 기대합니다.\n조직 내 기술 방향성, 리딩 경험, 시스템 설계 전반에 대한 인사이트를 중심으로 \n질문합니다",
    stars: 4,
  },
];

const DiffSetup = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { navigateTo } = useSetupNavigationStore((state) => state);

  useEffect(() => {
    setTabSelect("설정");
  }, []);

  const handlePrevious = () => {
    navigateTo("DeviceSetup");
  };

  const handleNext = () => {
    navigateTo("RoleSetup");
  };

  const [selected, setSelected] = useState("신입");

  return (
    <div
      className="w- mx-auto flex w-full flex-col items-center justify-center px-4 py-4 2xl:py-8"
      style={{ height: "calc(100vh - 14rem)" }}
    >
      <div className="text-zik-text mt-4 mb-8 text-2xl font-bold">
        질문 난이도를 설정하세요
      </div>

      <ul className="w-2xl space-y-4">
        {levels.map((level) => {
          const isSelected = selected === level.label;

          return (
            <li
              key={level.label}
              onClick={() => setSelected(level.label)}
              className={clsx(
                "border-zik-border flex h-20 cursor-pointer flex-col justify-center overflow-hidden rounded-xl border px-6 py-4 transition-all duration-300 ease-in-out",
                {
                  "bg-zik-main/30 h-30 text-[#291B9A] duration-300 2xl:h-36":
                    isSelected,
                },
              )}
            >
              <div
                className={clsx("flex items-center justify-start gap-7", {
                  "px-7": !isSelected,
                })}
              >
                <div className="flex min-w-[160px] items-center gap-2">
                  {isSelected && (
                    <img
                      src={checkedCircle}
                      alt="selected"
                      className="h-5 w-5 shrink-0"
                    />
                  )}
                  <strong className="px-7 text-lg 2xl:text-xl">
                    {level.label}
                  </strong>
                </div>
                <div className="flex gap-1">
                  {Array(level.stars)
                    .fill(0)
                    .map((_, idx) => (
                      <img
                        key={idx}
                        src={isSelected ? starFill : starEmpty}
                        alt="star"
                        className="h-4 w-4"
                      />
                    ))}
                </div>
              </div>

              <div
                className={clsx(
                  "transform transition-all duration-300 ease-in-out",
                  isSelected
                    ? "max-h-40 translate-y-0 opacity-100"
                    : "max-h-0 translate-y-[-10px] opacity-0",
                )}
              >
                {level.description && (
                  <p className="mt-2 px-14 text-sm leading-relaxed whitespace-pre-wrap text-[#291B9A] 2xl:text-base">
                    {level.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* <div class="relative bottom-0 mt-5 flex justify-center gap-15 2xl:!absolute 2xl:!bottom-10"> */}
      {/* <div class="absolute bottom-16 flex justify-center gap-15"> */}
      <div className="absolute bottom-10 flex justify-center gap-15">
        <Button color="gray" onClick={handlePrevious}>
          이전
        </Button>
        <Button onClick={handleNext}>다음</Button>
      </div>
      {/* <div className="mt-10 flex gap-15">
        <Button color="gray">이전</Button>
        <Button>다음</Button>
      </div> */}
    </div>
  );
};

export default DiffSetup;
