import React from 'react';

/**
 * 질문 목록 테이블 헤더 컴포넌트
 * QuestionBookmarkList 및 EmptyBookmarkList에서 공통으로 사용
 */
export const QuestionTableHeader = () => (
  <div className="mb-3 hidden grid-cols-12 items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 text-xs font-semibold tracking-wide text-gray-400 sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base">
    <div className="pr-4 text-center sm:pr-6 md:pr-14">No</div>
    <div className="col-span-0 pr-4 text-center sm:pr-6 md:pr-13">직무</div>
    <div className="col-span-1 pl-4 text-center sm:pl-6 md:pl-12">유형</div>
    <div className="col-span-8 pl-4 text-left sm:pl-6 md:pl-25">질문</div>
    <div className="col-span-1 flex justify-center">즐겨찾기</div>
  </div>
);

/**
 * 분석 결과 리스트 테이블 헤더 컴포넌트
 * QuestionList에서 사용
 */
export const ResultsTableHeader = () => (
  <div className="mb-3 hidden grid-cols-12 items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-4 py-2 text-sm font-semibold tracking-wide text-gray-400 sm:grid">
    <div className="col-span-1 text-center">No</div>
    <div className="col-span-4 text-left pl-4">제목</div>
    <div className="col-span-2 text-center">점수</div>
    <div className="col-span-3 text-center">날짜</div>
    <div className="col-span-1 text-center">조회</div>
    <div className="col-span-1 flex justify-center">즐겨찾기</div>
  </div>
);

/**
 * 북마크 및 분석 결과가 없을 때 사용하는 공통 컴포넌트
 */
export const EmptyStateContainer = ({ 
  icon, 
  title, 
  description, 
  subDescription, 
  buttonText, 
  buttonLink 
}) => (
  <div className="flex flex-col items-center text-gray-400 mt-8">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
      {icon}
    </div>
    <span>{title}</span>
    <span className="mt-2 text-sm">
      {description}
    </span>
    {subDescription && <span className="text-sm">{subDescription}</span>}
    <button
      className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-white transition-colors hover:bg-indigo-600"
      onClick={() => (window.location.href = buttonLink)}
    >
      {buttonText}
    </button>
  </div>
);

export default {
  QuestionTableHeader,
  ResultsTableHeader,
  EmptyStateContainer
}; 