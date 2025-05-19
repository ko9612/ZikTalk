// 분석 관련 모달
import React, { useEffect, useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import AnalysisCompleteIcon from "./AnalysisCompleteIcon";
import MainLogo from "@/assets/images/logo.webp";
import { Link } from "react-router-dom";
import LoadingIcon from "@/components/common/LoadingIcon";
import Button from "@/components/common/Button";
import { useQuestionStore } from "@/store/store";
import { createInterview, getInterviewFeedback } from "@/api/interviewApi";
import { useInterviewStore } from "@/store/interviewSetupStore";

const AnalysisStateModal = ({ isOpen, onClose, dimmed }) => {
  const [isLoading, setIsLoading] = useState(true);
  const level = useInterviewStore((state) => state.level);
  const career = useInterviewStore((state) => state.career);
  const ratio = useInterviewStore((state) => state.ratio);
  const { interviewId, questions, answers, video } = useQuestionStore();
  const userId = useInterviewStore((state) => state.userId);

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
        console.log(data);
        return data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 피드백받은 데이터 + 질문 리스트, 내 답변, 질문별 영상 조합해서 백엔드로 post
  const postResultData = async (feedback) => {
    const personalityWeight = (100 - ratio) / 100;
    const jobWeight = ratio / 100;
    const interviewData = {
      interviewId: interviewId,
      userId: userId,
      role: career,
      totalScore:
        Math.round(feedback.personalityScore * personalityWeight) +
        Math.round(feedback.jobScore * jobWeight),
      personalityScore: feedback.personalityScore || 0,
      personalityEval: feedback.personalityEval || "",
      jobScore: feedback.jobScore || 0,
      jobEval: feedback.jobEval || "",
      summary: feedback.summary || "",
      strengths: feedback.strengths || "",
      improvements: feedback.improvements || "",
      bookmarked: false,
      questions: questions.map((q, index) => ({
        order: index + 1,
        type: q.type === "인성" ? "PERSONALITY" : "JOB",
        content: q.question,
        myAnswer: answers[index] || "",
        videoUrl: video[index] || "",
        recommended: feedback.recommended[index] || "",
        bookmarked: false,
      })),
    };
    console.log("전송할 인터뷰 데이터:", interviewData);
    try {
      const data = await createInterview(interviewData);
      if (data) {
        console.log("보낸 인터뷰 데이터:", data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const img = new Image();
    img.src = MainLogo;

    const runAnalysis = async () => {
      const feedback = await requestFeedback();
      if (feedback) {
        console.log(userId);
        await postResultData(feedback);
      }
    };

    runAnalysis();
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
            <Link to={`/interview-result/${interviewId}`}>
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
