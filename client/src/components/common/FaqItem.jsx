import React, { useState } from 'react';
/**
 * FAQ 아이템 컴포넌트
 * @param {string} id - FAQ 아이템의 고유 ID
 * @param {string} title - FAQ 아이템의 제목
 * @param {string} career - 경력 정보 (선택적)
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
  title,
  career,
  question,
  answer,
  recommendation,
  isExpanded: propIsExpanded,
  onToggle,
  isStarred,
  onStarToggle,
}) => {
  // 내부 확장 상태 관리
  const [localIsExpanded, setLocalIsExpanded] = useState(propIsExpanded || false);
  
  // 상태 관리를 위한 실제 확장 상태
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;
  
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
          "border border-gray-200 bg-white shadow-md " +
          (isExpanded ? 'rounded-3xl' : 'rounded-full')
        }
      >
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* 콘텐츠 래퍼 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {/* ID 표시 */}
              <span className={`text-gray-400 text-sm font-bold ${isExpanded ? 'text-zik-main font-medium' : ''}`}>{id}</span>
              {/* 제목 표시 */}
              <div className={`text-base font-medium text-gray-900 ${isExpanded ? 'font-bold text-zik-main' : ''}`}>{title}</div>
              {/* 경력 정보 표시 (있을 경우) */}
              {career && <div className={`ml-2 text-xs font-medium px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700${isExpanded ? ' text-zik-main' : ''}`}>{career}</div>}
              {/* 축소 상태일 때 질문 미리보기 표시 */}
              {!isExpanded && question && (
                <div className="text-gray-600 ml-2 text-sm flex items-center line-clamp-1">
                  {question}
                </div>
              )}
            </div>
          </div>
          {/* 버튼 그룹 */}
          <div className="flex items-center gap-2 ml-2">
            {/* 토글 버튼 */}
            <button
              onClick={handleToggle}
              className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? '접기' : '펼치기'}
            >
              {/* 토글 아이콘 */}
              <span className="transition-transform duration-300">
                <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z" fill="#7B7B7B" stroke="#DFDFDF" stroke-width="0.0488281"/>
                </svg>
              </span>
            </button>
            {/* 즐겨찾기 버튼 */}
            <button
              onClick={onStarToggle}
              className="w-8 h-8 flex items-center justify-center hover:bg-zik-main/10 ml-1 rounded-full"
              aria-label={isStarred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {/* 별 아이콘 */}
              <svg
                className={`w-5 h-5 ${isStarred ? 'text-zik-main' : 'text-gray-300'}`}
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
        {isExpanded && (
          <div className="px-6 py-4 bg-white">
            {/* 질문 섹션 */}
            {question && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">질문</div>
                <div className="text-gray-800 bg-gray-50 p-3 rounded-2xl">{question}</div>
              </div>
            )}
            {/* 답변 섹션 */}
            {answer && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">내 답변</div>
                <div className="text-gray-800 bg-gray-50 p-3 rounded-2xl">{answer}</div>
              </div>
            )}
            {/* 추천 답변 섹션 */}
            {recommendation && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">추천 답변</div>
                <div className="text-gray-800 bg-gray-50 p-3 rounded-2xl">{recommendation}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqItem;