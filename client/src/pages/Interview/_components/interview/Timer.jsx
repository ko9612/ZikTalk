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
import { useSmoothValue } from "@/hooks/useSmoothvalue";
// import { getTextConverter } from "@/api/interviewApi";

const Timer = (qes) => {
  const { isLoading, setIsLoading } = useLoadingStateStore();
  const setInterviewState = useInterviewStateStore(
    (state) => state.setInterviewState,
  );
  const { isReplying, setIsReplying } = useReplyingStore();
  const [transcripts, setTranscripts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const percentage = (timeLeft / (isReplying ? 120 : 30)) * 100;
  const [resetKey, setResetKey] = useState(0);
  const smoothValue = useSmoothValue(percentage, 0.02, resetKey);
  // const recorderRef = useRef(null);
  // const streamRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 녹음 중단
  const stopRecording = () => {
    // if (recorderRef.current) {
    //   recorderRef.current.stop();
    //   recorderRef.current = null;
    // }
    // if (streamRef.current) {
    //   streamRef.current.getTracks().forEach((track) => track.stop());
    //   streamRef.current = null;
    // }

    setIsReplying(false);
    setInterviewState("answer");

    // setIsReplying(false);
    // setInterviewState("answer");
  };

  const buttonHandler = () => {
    if (isReplying) {
      stopRecording();
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsReplying(true);
      }, 500);
    }
  };

  // useEffect(() => {
  //   if (isReplying) {
  //     const handleTranscription = async () => {
  //       try {
  //         // 마이크 입력 캡처
  //         const stream = await navigator.mediaDevices.getUserMedia({
  //           audio: true,
  //         });
  //         streamRef.current = stream;
  //         const mediaRecorder = new MediaRecorder(stream);
  //         recorderRef.current = mediaRecorder;

  //         mediaRecorder.ondataavailable = async (event) => {
  //           try {
  //             const transcript = await getTextConverter(event.data);
  //             setTranscripts((prev) => [...prev, transcript]);
  //           } catch (error) {
  //             console.error("Transcription Error:", error);
  //           }
  //         };

  //         mediaRecorder.start();

  //         setTimeout(() => {
  //           stopRecording();
  //         }, 120000);
  //       } catch (error) {
  //         console.error("Mic Error:", error);
  //         alert("마이크 접근에 실패했습니다.");
  //       }
  //     };

  //     handleTranscription();
  //   }

  //   return () => {
  //     stopRecording();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (timerRef.current) {
  //     clearInterval(timerRef.current);
  //   }

  //   const initialTime = isReplying ? 120 : 30;
  //   setTimeLeft(initialTime);

  //   timerRef.current = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(timerRef.current);
  //         stopRecording();
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => {
  //     if (timerRef.current) clearInterval(timerRef.current);
  //   };
  // }, [isReplying]);

  useEffect(() => {
    if (qes && !isLoading) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const initialTime = isReplying ? 120 : 30;
      setTimeLeft(initialTime);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimeout(() => {
              buttonHandler();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReplying, qes]);

  useEffect(() => {
    setResetKey((prev) => prev + 1);
  }, [isReplying]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {!isLoading && isReplying && (
        <div className="absolute top-0">
          <RecordingAnimation />
        </div>
      )}
      <div className="relative mt-16 w-fit">
        <Graph
          value={isLoading ? 0 : smoothValue}
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
      {transcripts.map((line, idx) => (
        <p key={idx}>{line}</p>
      ))}
    </div>
  );
};

export default Timer;
