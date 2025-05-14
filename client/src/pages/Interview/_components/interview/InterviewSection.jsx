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
  const { questions, answers, addQuestion, curNum, skillCnt } =
    useQuestionStore();
  const { level, qCount, career, ratio } = useInterviewStore();

  const [question, setQuestion] = useState({
    qes: "",
    totalNum: qCount,
    curNum: curNum,
  });

  useEffect(() => {
    setTabSelect("모의 면접");
    const fetchFirstQuestion = async () => {
      try {
        const data = await getInterviewQuestion(level, qCount, career, ratio);
        if (data && data[0].question && data[0].type) {
          setQuestion({
            qes: data[0].question,
            totalNum: qCount,
            curNum: curNum,
            type: data[0].type,
          });

          addQuestion(data.question);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch first question:", error);
      }
    };
    fetchFirstQuestion();
  }, []);

  return (
    <section className="flex h-full flex-1 flex-col justify-center gap-5 px-24">
      <QuestionBox {...question} />
      {interviewState === "answer" ? (
        <Answer end={question.curNum === question.totalNum} text="예시 답변" />
      ) : (
        <Timer qes={question.qes} />
      )}
    </section>
  );
};

export default InterviewSection;
