import React from 'react';
import { Star } from 'lucide-react';

const FaqItem = ({
  id,
  title,
  career,
  question,
  answer,
  recommendation,
  isExpanded,
  onToggle,
  isStarred,
  onStarToggle,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <span className="text-gray-500 text-sm">{id}</span>
          <div className="text-lg font-semibold mt-1">{title}</div>
          {career && <div className="text-sm text-gray-600 mt-1">{career}</div>}
          {!isExpanded && question && (
            <div className="text-gray-600 mt-2">
              {question.length > 20 ? question.slice(0, 20) + '...' : question}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className={`p-2 rounded-full hover:bg-gray-100 ${isExpanded ? 'rotate-180' : ''}`}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onStarToggle}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label={isStarred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <Star size={16} color={isStarred ? "#7871FE" : "#d1d5db"} fill={isStarred ? "#7871FE" : "none"} />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {question && (
            <div className="border-t pt-4">
              <div className="font-semibold text-gray-700 mb-2">질문</div>
              <div className="text-gray-600">{question}</div>
            </div>
          )}
          {answer && (
            <div className="border-t pt-4">
              <div className="font-semibold text-gray-700 mb-2">내 답변</div>
              <div className="text-gray-600">{answer}</div>
            </div>
          )}
          {recommendation && (
            <div className="border-t pt-4">
              <div className="font-semibold text-gray-700 mb-2">추천 답변</div>
              <div className="text-gray-600">{recommendation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaqItem; 