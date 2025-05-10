import React from 'react';
import { GRID_TEMPLATE } from './constants';
import FilterDropdown from "@/components/common/FilterDropdown";
import { JOB_OPTIONS, TYPE_OPTIONS } from "../../common/useFilter";

/**
 * 필터 컴포넌트
 */
export const FilterComponent = ({ filters, onJobFilterChange, onTypeFilterChange }) => (
  <div className="mb-2 flex items-center justify-between gap-1">
    <div className="flex items-center gap-1">
      <FilterDropdown
        value={filters.job}
        onChange={onJobFilterChange}
        options={JOB_OPTIONS}
        className="mr-8 w-35"
      />
      <FilterDropdown
        value={filters.questionType}
        onChange={onTypeFilterChange}
        options={TYPE_OPTIONS}
        className="w-26"
      />
    </div>
  </div>
);

/**
 * 테이블 헤더 컴포넌트
 */
export const TableHeader = () => (
  <div 
    className="mb-3 hidden items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 text-xs font-semibold tracking-wide text-gray-400 sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base"
    style={{ gridTemplateColumns: GRID_TEMPLATE }}
  >
    <div className="text-start">No</div>
    <div className="text-start pl-6">직무</div>
    <div className="text-center">유형</div>
    <div className="pl-4 text-left">질문</div>
    <div className="flex justify-center">즐겨찾기</div>
  </div>
);

/**
 * 로딩 인디케이터 컴포넌트
 */
export const LoadingIndicator = () => (
  <div className="my-6 flex justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

/**
 * 더 불러오기 안내 컴포넌트
 */
export const ScrollPrompt = () => (
  <div className="my-4 text-center text-sm text-gray-400 py-2 rounded-lg">
    스크롤하여 더 많은 북마크를 확인하세요 ▼
  </div>
); 