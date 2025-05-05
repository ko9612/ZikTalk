import React, { useState } from "react";
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
  const [localIsExpanded, setLocalIsExpanded] = useState(
    propIsExpanded || false,
  );

  // 상태 관리를 위한 실제 확장 상태
  const isExpanded =
    propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;

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
  return (
    <div className="mb-4">
      <div
        className={
          "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-300"
        }
      >
        {/* 헤더 영역 */}
        <div className="flex items-center px-6 py-4">
          {/* badge row: 고정 너비 */}
          <div className="flex items-center" style={{ width: 220 }}>
            <span
              className={`text-sm font-bold text-gray-400 ${isExpanded ? "text-zik-main font-medium" : ""}`}
            >
              {id}
            </span>
            {/* career badge: 고정 너비, 한 줄 표시, question과의 간격을 넓히기 위해 mr-4 추가 */}
            {career && (
              <div className="mr-4 ml-2 w-[100px] rounded-full px-2 py-1 text-center text-sm font-bold whitespace-nowrap text-gray-700">
                {career}
              </div>
            )}
            {/* type badge: 고정 너비, career와의 간격은 ml-2만 유지 */}
            {type && (
              <div className="ml-2 w-[60px] rounded-full px-2 py-1 text-center text-sm font-bold text-gray-700">
                {type}
              </div>
            )}
          </div>
          {/* question */}
          <div className="ml-4 min-w-0 flex-1 truncate text-base font-medium text-gray-900">
            {question}
          </div>
          {/* 버튼 그룹 */}
          <div className="ml-4 flex items-center gap-2">
            {/* 토글 버튼 */}
            <button
              onClick={handleToggle}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 hover:bg-gray-100 ${isExpanded ? "rotate-180" : ""}`}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              {/* 토글 아이콘 */}
              <span className="transition-transform duration-300">
                <svg
                  width="15"
                  height="13"
                  viewBox="0 0 20 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
              onClick={onStarToggle}
              className="hover:bg-zik-main/10 ml-1 flex h-8 w-8 items-center justify-center rounded-full"
              aria-label={isStarred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              {/* 별 아이콘 */}
              <svg
                className={`h-5 w-5 ${isStarred ? "text-zik-main" : "text-gray-300"}`}
                viewBox="0 0 24 24"
                fill={isStarred ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
        </div>
        {/* 확장된 콘텐츠 영역 */}
        <div
          className={`overflow-hidden rounded-b-2xl bg-white px-6 transition-all duration-300 ${
            isExpanded
              ? "max-h-[1000px] py-4 opacity-100"
              : "max-h-0 py-0 opacity-0"
          }`}
          style={{ willChange: "max-height, opacity, padding" }}
        >
          {/* 질문 섹션 */}
          {question && (
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-gray-500">질문</div>
              <div className="rounded-2xl bg-gray-50 p-4 text-base text-gray-800">
                {question}
              </div>
            </div>
          )}
          {/* 답변 섹션 */}
          {answer && (
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-gray-500">
                내 답변
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-base text-gray-800">
                {answer}
              </div>
            </div>
          )}
          {/* 추천 답변 섹션 */}
          {recommendation && (
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-gray-500">
                추천 답변
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-base text-gray-800">
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
