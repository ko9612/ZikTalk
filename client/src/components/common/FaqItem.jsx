import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const FaqItem = ({
  id,
  career,
  type,
  question,
  answer,
  recommendation,
  isExpanded: propIsExpanded,
  onToggle,
  isStarred,
  onStarToggle,
  textColors = {
    normal: "text-gray-500",
    accent: "text-zik-main",
  }
}) => {
  const [localIsExpanded, setLocalIsExpanded] = useState(false);

  const isExpanded =
    propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalIsExpanded(!localIsExpanded);
    }
  };

  const handleStarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStarToggle) {
      onStarToggle();
    }
  };

  return (
    <div className="mb-4">
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-300"
        onClick={handleToggle}
      >
        <div className="absolute top-3 right-4 z-10 flex flex-row items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 hover:bg-gray-100 sm:h-8 sm:w-8 ${isExpanded ? "rotate-180" : ""}`}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            <span className="transition-transform duration-300">
              <svg
                width="12"
                height="10"
                viewBox="0 0 20 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:h-[13px] sm:w-[15px]"
              >
                <path
                  d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                  fill="#7B7B7B"
                  stroke="#DFDFDF"
                  strokeWidth="0.0488281"
                />
              </svg>
            </span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleStarClick(e);
            }}
            className="hover:bg-zik-main/10 ml-1 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 sm:h-8 sm:w-8"
            aria-label={isStarred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            <FaStar
              className={`h-4 w-4 transition-colors duration-300 ease-in-out sm:h-5 sm:w-5 ${isStarred ? textColors.accent : "text-gray-200"}`}
              style={{
                transform: isStarred ? "scale(1.1)" : "scale(1)",
                transition:
                  "transform 0.3s ease-in-out, color 0.3s ease-in-out",
              }}
            />
          </button>
        </div>
        <div className="flex w-full flex-col items-baseline px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center">
            <span
              className={`text-zik-text text-xs font-bold sm:text-sm ${isExpanded ? `${textColors.accent} font-medium` : ""}`}
            >
              {id}
            </span>
            {career && (
              <div
                className={`mr-2 ml-1 w-24 rounded-full px-1 py-0.5 text-center text-start text-xs font-bold whitespace-nowrap ${textColors.normal} sm:mr-4 sm:ml-2 sm:w-[100px] sm:px-2 sm:py-1 sm:text-base`}
              >
                {career}
              </div>
            )}
            {type && (
              <div
                className={`ml-1 w-auto rounded-full px-1 py-0.5 text-center text-xs font-bold ${textColors.normal} sm:ml-2 sm:w-[60px] sm:px-2 sm:py-1 sm:text-base`}
              >
                {type}
              </div>
            )}
          </div>
          <div
            className={`mt-1 min-w-0 flex-1 text-sm font-medium break-words whitespace-normal ${textColors.normal} transition-all duration-500 ease-in-out sm:mt-0 sm:ml-2 sm:text-base ${
              isExpanded ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
            }`}
          >
            {question}
          </div>
        </div>
        <div
          className={`overflow-hidden rounded-b-2xl bg-white px-4 transition-all duration-300 sm:px-6 ${
            isExpanded
              ? "max-h-[1000px] py-3 opacity-100 sm:py-4"
              : "max-h-0 py-0 opacity-0"
          }`}
          style={{ willChange: "max-height, opacity, padding" }}
        >
          <div className="mb-3 sm:mb-4">
            <div
              className={`mb-1 text-sm font-medium ${textColors.normal} sm:mb-2 sm:text-base`}
            >
              질문
            </div>
            <div
              className={`rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 sm:p-4 sm:text-base`}
            >
              {question}
            </div>
          </div>
          {answer && (
            <div className="mb-3 sm:mb-4">
              <div
                className={`mb-1 text-sm font-medium ${textColors.normal} sm:mb-2 sm:text-base`}
              >
                내 답변
              </div>
              <div
                className={`rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 sm:p-4 sm:text-base`}
              >
                {answer}
              </div>
            </div>
          )}
          {recommendation && (
            <div className="mb-3 sm:mb-4">
              <div
                className={`mb-1 text-sm font-medium ${textColors.normal} sm:mb-2 sm:text-base`}
              >
                추천 답변
              </div>
              <div
                className={`rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 sm:p-4 sm:text-base`}
              >
                {recommendation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
