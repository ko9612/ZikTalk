import React from "react";
import Comprehensive from "./_components/Comprehensive";
import InterviewVideo from "./_components/InterviewVideo";
import Question from "./_components/Question";
import { useNavigate } from "react-router-dom";

const titleStyle = "text-zik-text text-[28px] font-bold mt-[50px]";

const Index = () => {
  const navigate = useNavigate();

  const gotoMypageResult = () => {
    navigate("/mypage/result-list");
  };

  return (
    <>
      <div className="flex items-center justify-center px-7">
        <div className="mx-auto my-0 mt-7 mb-7 w-[70vw]">
          {/* 분석 결과 상단 */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={gotoMypageResult}
              className="text-zik-main flex items-center font-semibold"
            >
              <svg
                width="15"
                height="8"
                viewBox="0 0 20 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-90"
              >
                <path
                  d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                  fill="#7871FE"
                  stroke="#7871FE"
                  strokeWidth="0.0488281"
                />
              </svg>
              분석결과리스트
            </button>
            <h2 className="text-zik-text text-2xl font-bold sm:text-3xl md:text-4xl">
              백엔드 개발자-1
            </h2>
            <p className="text-zik-text text-xs md:text-sm">2025.04.19</p>
          </div>

          <h3 className={titleStyle}>종합 분석</h3>
          <Comprehensive />

          <h3 className={titleStyle}>면접 영상</h3>
          <InterviewVideo />

          <h3 className={titleStyle}>질문</h3>
          <Question />
        </div>
      </div>
    </>
  );
};

export default Index;
