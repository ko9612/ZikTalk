import React, { useState } from 'react';
import faqItemStyles from '../../styles/faqItem';

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
    <div className={faqItemStyles.wrapper}>
      {/* FAQ 아이템 컨테이너 - 확장 상태에 따라 스타일 변경 */}
      <div className={`${faqItemStyles.container} ${isExpanded ? ' shadow-md !rounded-3xl' : ' !rounded-full'}`}>
        {/* 헤더 영역 */}
        <div className={`${faqItemStyles.header} ${isExpanded ? 'border-b border-gray-200 pb-3' : ''} `}>
          {/* 콘텐츠 래퍼 */}
          <div className={faqItemStyles.contentWrapper}>
            <div className="flex items-center gap-2">
              {/* ID 표시 */}
              <span className={`${faqItemStyles.id} ${isExpanded ? 'text-zik-main font-medium' : ''}`}>{id}</span>
              {/* 제목 표시 */}
              <div className={`${faqItemStyles.title} ${isExpanded ? 'font-bold text-zik-main' : ''}`}>{title}</div>
              {/* 경력 정보 표시 (있을 경우) */}
              {career && <div className={`${faqItemStyles.career} ${isExpanded ? 'bg-gray-100 text-gray-700' : 'bg-gray-200'} px-2 py-1 rounded-full text-sm`}>{career}</div>}
              {/* 축소 상태일 때 질문 미리보기 표시 */}
              {!isExpanded && question && (
                <div className={`${faqItemStyles.question} text-gray-600 ml-2 text-sm flex items-center line-clamp-1`}>
                  {question}
                </div>
              )}
            </div>
          </div>
          {/* 버튼 그룹 */}
          <div className={faqItemStyles.buttonGroup}>
            {/* 토글 버튼 */}
            <button
              onClick={handleToggle}
              className={`${faqItemStyles.toggleButton.base} ${
                isExpanded ? faqItemStyles.toggleButton.expanded : faqItemStyles.toggleButton.default
              } transition-transform duration-300 rounded-full`}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? '접기' : '펼치기'}
            >
              {/* 토글 아이콘 */}
              <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {/* 즐겨찾기 버튼 */}
            <button
              onClick={onStarToggle}
              className={`${faqItemStyles.starButton} rounded-full`}
              aria-label={isStarred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {/* 별 아이콘 */}
              <svg 
                className={`${faqItemStyles.starIcon.base} ${
                  isStarred ? faqItemStyles.starIcon.active : faqItemStyles.starIcon.inactive
                }`}
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
          <div className={`${faqItemStyles.expandedContent} p-4 bg-white rounded-b-3xl`}>
            {/* 질문 섹션 */}
            {question && (
              <div className={`${faqItemStyles.section} mb-4`}>
                <div className={`${faqItemStyles.sectionTitle} text-sm font-medium text-gray-500 mb-2`}>질문</div>
                <div className={`${faqItemStyles.sectionContent} text-gray-800 bg-gray-50 p-3 rounded-3xl`}>{question}</div>
              </div>
            )}
            {/* 답변 섹션 */}
            {answer && (
              <div className={`${faqItemStyles.section} mb-4`}>
                <div className={`${faqItemStyles.sectionTitle} text-sm font-medium text-gray-500 mb-2`}>내 답변</div>
                <div className={`${faqItemStyles.sectionContent} text-gray-800 bg-gray-50 p-3 rounded-3xl`}>{answer}</div>
              </div>
            )}
            {/* 추천 답변 섹션 */}
            {recommendation && (
              <div className={faqItemStyles.section}>
                <div className={`${faqItemStyles.sectionTitle} text-sm font-medium text-gray-500 mb-2`}>추천 답변</div>
                <div className={`${faqItemStyles.sectionContent} text-gray-800 bg-gray-50 p-3 rounded-3xl`}>{recommendation}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqItem;