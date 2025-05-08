import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
/**
 * FAQ 아이템 컴포넌트
 * @param {string} id - FAQ 아이템의 고유 ID
 * @param {string} career - 경력 정보 (선택적)
 * @param {string} type - 타입 정보 (선택적)
 * @param {string} question - 질문 내용
 * @param {string} answer - 답변 내용
 * @param {string} recommendation - 추천 답변 내용
 * @param {boolean} isExpanded - 확장 상태 여부 (외부에서 제어할 경우)
 * @param {function} onToggle - 확장 상태 변경 핸들러 (외부에서 제어할 경우)
 * @param {boolean} isStarred - 즐겨찾기 상태 여부
 * @param {function} onStarToggle - 즐겨찾기 상태 변경 핸들러
 */
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
}) => {
  // 내부 확장 상태 관리
  const [localIsExpanded, setLocalIsExpanded] = useState(false);

  // 상태 관리를 위한 실제 확장 상태
  const isExpanded =
    propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;

  const textColors = {
    normal: "text-gray-700",
    accent: "text-zik-main",
  };

  /**
   * 토글 핸들러 - 외부 제어 또는 내부 상태 변경
   */
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalIsExpanded(!localIsExpanded);
    }
  };

  /**
   * 즐겨찾기 버튼 클릭 핸들러 - 이벤트 전파 방지
   */
  const handleStarClick = (e) => {
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
        {/* 버튼 그룹: 오른쪽 상단에 고정 */}
        <div className="absolute top-3 right-4 z-10 flex flex-row items-center gap-2">
          {/* 토글 버튼 */}
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
          {/* 즐겨찾기 버튼 */}
          <button
            onClick={handleStarClick}
            className="hover:bg-zik-main/10 ml-1 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 sm:h-8 sm:w-8"
            aria-label={isStarred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            <FaStar
              className={`h-4 w-4 transition-colors duration-300 ease-in-out sm:h-5 sm:w-5 ${isStarred ? textColors.accent : "text-gray-200"}`}
              style={{
                transform: isStarred ? "scale(1.2)" : "scale(1)",
                transition:
                  "transform 0.3s ease-in-out, color 0.3s ease-in-out",
              }}
            />
          </button>
        </div>
        {/* badge row + 제목 */}
        <div className="flex w-full flex-col items-baseline px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          {/* badge row */}
          <div className="flex min-w-0 items-center">
            <span
              className={`text-zik-text text-xs font-bold sm:text-sm ${isExpanded ? `${textColors.accent} font-medium` : ""}`}
            >
              {id}
            </span>
            {career && (
              <div
                className={`mr-2 ml-1 w-auto rounded-full px-1 py-0.5 text-center text-xs font-bold whitespace-nowrap ${textColors.normal} sm:mr-4 sm:ml-2 sm:w-[100px] sm:px-2 sm:py-1 sm:text-base`}
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
            className={`mt-1 min-w-0 flex-1 text-sm font-medium break-words whitespace-normal text-gray-900 sm:mt-0 sm:ml-2 sm:text-base transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
            }`}
          >
            {question}
          </div>
        </div>
        {/* 확장된 콘텐츠 영역 */}
        <div
          className={`overflow-hidden rounded-b-2xl bg-white px-4 transition-all duration-300 sm:px-6 ${
            isExpanded
              ? "max-h-[1000px] py-3 opacity-100 sm:py-4"
              : "max-h-0 py-0 opacity-0"
          }`}
          style={{ willChange: "max-height, opacity, padding" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 추가된 부분: 질문 섹션 */}
          <div className="mb-3 sm:mb-4">
            <div className={`mb-1 text-sm font-medium text-gray-500 sm:mb-2 sm:text-base`}>
              질문
            </div>
            <div className={`rounded-2xl  bg-gray-50  p-3 text-sm text-gray-800 sm:p-4 sm:text-base`}>
              {question}
            </div>
          </div>
          {/* 답변 섹션 */}
          {answer && (
            <div className="mb-3 sm:mb-4">
              <div
                className={`mb-1 text-sm font-medium text-gray-500 sm:mb-2 sm:text-base`}
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
          {/* 추천 답변 섹션 */}
          {recommendation && (
            <div className="mb-3 sm:mb-4">
              <div
                className={`mb-1 text-sm font-medium text-gray-500 sm:mb-2 sm:text-base`}
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
