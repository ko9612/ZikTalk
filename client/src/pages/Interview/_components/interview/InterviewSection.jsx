import React, { useEffect, useState } from "react";
import QuestionBox from "./QuestionBox";
import Timer from "./Timer";
import Answer from "./Answer";
import {
  useInterviewStateStore,
  useInterviewTabStore,
  useLoadingStateStore,
  useReplyingStore,
  useQuestionStore,
} from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";
import { getInterviewQuestion } from "@/api/interviewApi";

const InterviewSection = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { setInterviewState, interviewState } = useInterviewStateStore();
  const setIsLoading = useLoadingStateStore((state) => state.setIsLoading);
  const setIsReplying = useReplyingStore((state) => state.setIsReplying);
  const {
    questions,
    answers,
    resetInterview,
    addQuestion,
    curNum,
    setCurNum,
    skillCnt,
    setSkillCnt,
  } = useQuestionStore();
  const { level, qCount, career, ratio } = useInterviewStore();

  const [question, setQuestion] = useState({
    qes: "",
    totalNum: 0,
    curNum: 0,
  });

  useEffect(() => {
    const fetchFirstQuestion = async () => {
      const preQuestion = curNum > 1 ? questions[curNum - 2] : undefined;
      const preAnswer = curNum > 1 ? answers[curNum - 2] : undefined;
      try {
        const data = await getInterviewQuestion(
          level,
          qCount,
          career,
          ratio,
          curNum,
          skillCnt,
          preQuestion,
          preAnswer,
        );
        if (data && data.question && data.type) {
          setQuestion({
            qes: data.question,
            totalNum: qCount,
            curNum: curNum,
            type: data.type,
          });

          addQuestion(data.question);
          setCurNum(1);
          if (data.type === "직무") {
            setSkillCnt(skillCnt + 1);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch first question:", error);
      }
    };
    fetchFirstQuestion();
  }, []);

  useEffect(() => {
    setTabSelect("모의 면접");
    return () => {
      setInterviewState("question");
      setIsLoading(true);
      setIsReplying(false);
      resetInterview();
    };
  }, [setTabSelect, setIsLoading, setInterviewState, resetInterview]);

  return (
    <section className="flex h-full flex-1 flex-col justify-center gap-5 px-24">
      <QuestionBox {...question} />
      {interviewState === "answer" ? (
        <Answer end={question.curNum === question.totalNum} text="예시 답변" />
      ) : (
        <Timer />
      )}
    </section>
  );
};

export default InterviewSection;
