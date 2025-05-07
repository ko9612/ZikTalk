import React, { useEffect } from "react";
import QuestionBox from "./QuestionBox";
import Timer from "./Timer";
import Answer from "./Answer";
import { useInterviewTabStore } from "@/store/store";

const InterviewSection = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);

  useEffect(() => {
    setTabSelect("모의 면접");
  }, []);

  return (
    <section className="flex flex-col">
      <QuestionBox />
      <Timer />
      <Answer />
    </section>
  );
};

export default InterviewSection;
