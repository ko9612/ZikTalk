import React from "react";
import { FaTrash } from "react-icons/fa";
import { BsFillTrash2Fill } from "react-icons/bs";
import FilterDropdown from "@/components/common/FilterDropdown";
import { ResultCard } from "@/components/common/ResultCard";
import { SORT_OPTIONS } from "@/components/common/useFilter";
import { twMerge } from "tailwind-merge";
import { TEXT_COLORS } from "@/pages/myPage/_components/question/settings/constants";

export const Header = React.memo(({ showDescription = true }) => (
  <>
    <h2 className="text-zik-text mb-6 w-full text-center text-2xl font-bold sm:text-3xl">
      분석 결과 리스트
    </h2>
    {showDescription && (
      <div className={`mb-8 text-center text-sm ${TEXT_COLORS.description} sm:text-base`}>
        응시한 모의면접 결과를 한눈에 확인하고,
        <br className="hidden md:block" />
        점수와 피드백을 기반으로 부족한 부분을 보완해보세요.
      </div>
    )}
  </>
));

export const FilterBar = React.memo(
  ({ filterValue, onFilterChange, isDeleteMode, onDeleteToggle }) => (
    <div className="mx-auto mb-2 flex w-full max-w-5xl flex-row items-center justify-between gap-0">
      <div className="flex w-auto items-center">
        <FilterDropdown
          value={filterValue}
          onChange={onFilterChange}
          options={[
            { value: SORT_OPTIONS.LATEST, label: SORT_OPTIONS.LATEST },
            { value: SORT_OPTIONS.BOOKMARK, label: SORT_OPTIONS.BOOKMARK },
          ]}
        />
      </div>
      <button
        onClick={onDeleteToggle}
        className={twMerge(
          "bg-zik-main/10 text-zik-main hover:bg-zik-main/20 flex h-10 w-10 min-w-10 items-center justify-center rounded-full border border-none shadow-sm outline-none focus:outline-none",
          isDeleteMode && "bg-zik-main hover:bg-indigo-600",
        )}
      >
        {isDeleteMode ? (
          <BsFillTrash2Fill size={22} className="mx-auto text-white" />
        ) : (
          <FaTrash size={22} className="mx-auto" />
        )}
      </button>
    </div>
  ),
);

export const ResultGrid = React.memo(
  ({
    visibleResults,
    lastElementRef,
    isDeleteMode,
    selected,
    handleSelectToggle,
    handleBookmarkToggle,
    handleCardClick,
    starredItems,
  }) => (
    <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-6 sm:pt-4 lg:grid-cols-3">
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
  ),
);

export const LoadingIndicator = () => (
  <div className="my-6 flex justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export const ScrollPrompt = () => (
  <div className={`my-4 rounded-lg py-2 text-center text-sm ${TEXT_COLORS.description}`}>
    스크롤하여 더 많은 결과를 확인하세요 ▼
  </div>
);
