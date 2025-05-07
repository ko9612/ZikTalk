import React from "react";
import QuestionBox from "./QuestionBox";
import Timer from "./Timer";
import Answer from "./Answer";

const InterviewSection = () => {
  return (
    <section className="flex flex-col">
      <QuestionBox />
      <Timer />
      <Answer />
    </section>
  );
};

export default InterviewSection;
