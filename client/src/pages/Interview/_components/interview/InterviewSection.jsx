import React, { useEffect, useState } from "react";
import QuestionBox from "./QuestionBox";
import Timer from "./Timer";
import Answer from "./Answer";
import {
  useInterviewStateStore,
  useInterviewTabStore,
  useLoadingStateStore,
  useReplyingStore,
} from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";

const InterviewSection = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { setInterviewState, interviewState } = useInterviewStateStore();
  const setIsLoading = useLoadingStateStore((state) => state.setIsLoading);
  const setIsReplying = useReplyingStore((state) => state.setIsReplying);

  // 임시
  const exampleValue = {
    curNum: 10,
    totalNum: 10,
    question:
      "자신이 참여한 웹 개발 프로젝트에서 가장 중요했던 기술 스택은 무엇이었으며, 그 기술을 선택한 이유는 무엇인가요?",
  };

  const exampleAnswer =
    "제가 참여한 웹 개발 프로젝트에서 가장 중요했던 기술 스택은 React였습니다. SPA 형태의 서비스였기 때문에 빠른 렌더링과 동적인 화면 구성을 위해 React를 선택했습니다. 또한 컴포넌트 기반 구조 덕분에 팀원 간 협업이 효율적이었고, 재사용성도 높아 유지보수에 큰 도움이 되었습니다. 특히, 상태 관리를 위해 Redux를 함께 사용하면서 복잡한 데이터 흐름도 안정적으로 처리할 수 있었습니다.";

  useEffect(() => {
    setTabSelect("모의 면접");
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      setInterviewState("question");
      setIsLoading(true);
      setIsReplying(false);
    };
  }, [setTabSelect, setIsLoading, setInterviewState]);

  const { level, ratio, career, qCount } = useInterviewStore();

  return (
    <section className="flex h-full flex-1 flex-col justify-center gap-5 px-24">
      <QuestionBox {...exampleValue} />
      {interviewState === "answer" ? (
        <Answer
          end={exampleValue.curNum === exampleValue.totalNum}
          text={exampleAnswer}
        />
      ) : (
        <Timer />
      )}
    </section>
  );
};

export default InterviewSection;
