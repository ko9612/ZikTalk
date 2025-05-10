import React from 'react';
import { FaTrash } from "react-icons/fa";
import { BsFillTrash2Fill } from "react-icons/bs";
import FilterDropdown from "@/components/common/FilterDropdown";
import { ResultCard } from "../../common/ResultCard";
import { ResultsTableHeader } from "../../common/TableHeader";
import { SORT_OPTIONS } from "../../common/useFilter";

/**
 * 헤더 컴포넌트
 */
export const Header = React.memo(() => (
  <>
    <h2 className="text-zik-text mb-6 w-full text-center text-2xl font-bold sm:text-3xl">
      분석 결과 리스트
    </h2>
    <div className="mb-8 text-center text-sm text-gray-400 sm:text-base">
      응시한 모의면접 결과를 한눈에 확인하고,
      <br className="hidden md:block" />
      점수와 피드백을 기반으로 부족한 부분을 보완해보세요.
    </div>
  </>
));

/**
 * 필터바 컴포넌트
 */
export const FilterBar = React.memo(({ 
  filterValue, 
  onFilterChange, 
  isDeleteMode, 
  onDeleteToggle 
}) => (
  <div className="mx-auto mb-2 flex w-full max-w-5xl flex-row items-center justify-between gap-0">
    <div className="flex w-auto items-center">
      <FilterDropdown
        value={filterValue}
        onChange={onFilterChange}
        options={[
          { value: SORT_OPTIONS.LATEST, label: SORT_OPTIONS.LATEST },
          { value: SORT_OPTIONS.BOOKMARK, label: SORT_OPTIONS.BOOKMARK }
        ]}
      />
    </div>
    <button
      onClick={onDeleteToggle}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-[#8C82FF]/10 text-[#8C82FF] shadow-sm hover:bg-[#8C82FF]/20 ${isDeleteMode ? "bg-blues-200" : ""}`}
      style={{ minWidth: 40 }}
    >
      {isDeleteMode ? (
        <BsFillTrash2Fill size={22} className="mx-auto" />
      ) : (
        <FaTrash size={22} className="mx-auto" />
      )}
    </button>
  </div>
));

/**
 * 결과 그리드 컴포넌트
 */
export const ResultGrid = React.memo(({ 
  visibleResults, 
  lastElementRef, 
  isDeleteMode,
  selected,
  handleSelectToggle,
  handleBookmarkToggle,
  handleCardClick,
  starredItems 
}) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
    {visibleResults.map((item, idx) => (
      <div
        key={item.id}
        className="group"
        ref={idx === visibleResults.length - 1 ? lastElementRef : null}
      >
        <ResultCard
          item={item}
          isDeleteMode={isDeleteMode}
          selected={selected}
          handleSelectToggle={handleSelectToggle}
          handleBookmarkToggle={handleBookmarkToggle}
          handleCardClick={handleCardClick}
          starredItems={starredItems}
        />
      </div>
    ))}
  </div>
));

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
    스크롤하여 더 많은 결과를 확인하세요 ▼
  </div>
); 