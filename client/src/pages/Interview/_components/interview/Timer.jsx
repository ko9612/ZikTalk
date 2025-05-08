import Button from "@/components/common/Button";
import Graph from "@/components/common/Graph";
import LoadingIcon from "@/components/common/LoadingIcon";
import {
  useInterviewStateStore,
  useLoadingStateStore,
  useReplyingStore,
} from "@/store/store";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import RecordingAnimation from "./RecordingAnimation";
// import { useSmoothValue } from "@/hooks/useSmoothvalue";

const Timer = () => {
  const isLoading = useLoadingStateStore((state) => state.isLoading);
  const setInterviewState = useInterviewStateStore(
    (state) => state.setInterviewState,
  );
  const { isReplying, setIsReplying } = useReplyingStore();

  // 임시
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  // 임시
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 임시
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const initialTime = isReplying ? 120 : 30;
    setTimeLeft(initialTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (isReplying) {
            setTimeout(() => {
              setIsReplying(false);
              setInterviewState("answer");
            }, 1000);
          } else {
            setTimeout(() => {
              setIsReplying(true);
            }, 1000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReplying]);

  // 임시
  const buttonHandler = () => {
    if (isReplying) {
      setIsReplying(false);
      setInterviewState("answer");
    } else {
      setIsReplying(true);
    }
  };

  // 임시
  const percentage = (timeLeft / (isReplying ? 120 : 30)) * 100;
  // const smoothValue = useSmoothValue(percentage);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {!isLoading && isReplying && (
        <div className="absolute top-0">
          <RecordingAnimation />
        </div>
      )}
      <div className="relative mt-16 w-fit">
        <Graph
          value={isLoading ? 0 : percentage}
          size={300}
          strokeWidth={15}
          color={isReplying ? "#FE607D" : "var(--color-zik-main)"}
        />
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6">
          <div
            className={twMerge(
              "text-zik-main text-lg",
              isReplying && "text-[#FE607D]",
            )}
          >
            {isLoading
              ? "잠시만 기다려주세요"
              : isReplying
                ? "대답 시간"
                : "답변 준비 시간"}
          </div>
          <div
            className={twMerge(
              "text-zik-main text-6xl font-bold",
              isLoading && "text-5xl",
              isReplying && "text-[#FE607D]",
            )}
          >
            {isLoading ? "준비 중" : formatTime(timeLeft)}
          </div>
          {isLoading ? (
            <LoadingIcon />
          ) : (
            <Button
              color={isReplying ? "red" : "violet"}
              onClick={buttonHandler}
            >
              {isReplying ? "답변 완료" : "바로 답변하기"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;
