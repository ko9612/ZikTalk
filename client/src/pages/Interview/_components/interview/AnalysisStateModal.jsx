// 분석 관련 모달
import React, { useEffect, useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import AnalysisCompleteIcon from "./AnalysisCompleteIcon";
import MainLogo from "@/assets/images/logo.svg";
import { Link } from "react-router-dom";
import LoadingIcon from "@/components/common/LoadingIcon";
import Button from "@/components/common/Button";
import { useQuestionStore } from "@/store/store";

const AnalysisStateModal = ({ isOpen, onClose, dimmed, id }) => {
  // 임시
  const [isLoading, setIsLoading] = useState(true);

  //test
  const { interviewId, curNum, questions, answers, video } = useQuestionStore();

  // 임시
  useEffect(() => {
    const img = new Image();
    img.src = MainLogo;

    // gpt 피드백 요청 -> 받은 데이터 백엔드로
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

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
      {/* <div className="bg-amber-500 text-xs">
        <p>인터뷰 아이디: {interviewId}</p>
        <p>현재 번호: {curNum}</p>
        <p>
          질문들:
          {questions.map((e) => (
            <p>{e.question}</p>
          ))}
        </p>
        <p>
          내 답변들:
          {answers.map((e) => (
            <p>{e}</p>
          ))}
        </p>
        <p>
          면접 영상들:
          {video.map((e) => (
            <p>{e}</p>
          ))}
        </p>
      </div> */}
    </Modal>
  );
};

export default AnalysisStateModal;
