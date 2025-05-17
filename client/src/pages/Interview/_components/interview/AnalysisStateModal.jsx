// 분석 관련 모달
import React, { useEffect, useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import AnalysisCompleteIcon from "./AnalysisCompleteIcon";
import MainLogo from "@/assets/images/logo.svg";
import { Link } from "react-router-dom";
import LoadingIcon from "@/components/common/LoadingIcon";
import Button from "@/components/common/Button";
import { useQuestionStore } from "@/store/store";
import { getInterviewFeedback } from "@/api/interviewApi";
import { useInterviewStore } from "@/store/interviewSetupStore";

const AnalysisStateModal = ({ isOpen, onClose, dimmed, id }) => {
  // 임시
  const [isLoading, setIsLoading] = useState(true);
  const level = useInterviewStore((state) => state.level);
  const career = useInterviewStore((state) => state.career);
  const { interviewId, questions, answers, video } = useQuestionStore();

  // gpt 피드백 요청
  const requestFeedback = async () => {
    const content = questions.map((q, index) => ({
      question: q.question,
      answer: answers[index] || "",
      type: q.type,
    }));
    const postData = { career: career, level: level, content: content };
    try {
      const data = await getInterviewFeedback(postData);
      if (data) {
        setIsLoading(false);
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 피드백받은 데이터 + 질문 리스트, 내 답변, 질문별 영상 조합해서 백엔드로 post
  const postResultData = async () => {};

  useEffect(() => {
    const img = new Image();
    img.src = MainLogo;

    requestFeedback();
    postResultData();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-md"
      dimmed={dimmed}
      isDelete={false}
    >
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {isOpen && isLoading ? (
          <>
            <i className="w-12">
              <img src={MainLogo} alt="logo" />
            </i>
            <p className="text-center text-base font-semibold sm:text-xl">
              모의면접이 완료되었습니다.
            </p>
            <p className="text-zik-text text-center text-sm">
              답변 분석 및 피드백을 생성하는 중...
            </p>
            <LoadingIcon />
          </>
        ) : (
          <>
            <AnalysisCompleteIcon />
            <p className="text-center text-base font-semibold sm:text-xl">
              User님의 답변 분석이 완료되었습니다!
            </p>
            <Link to={`/interview-result/${id}`}>
              <Button shape="bar" className="px-8">
                분석 결과 페이지로 이동
              </Button>
            </Link>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AnalysisStateModal;
