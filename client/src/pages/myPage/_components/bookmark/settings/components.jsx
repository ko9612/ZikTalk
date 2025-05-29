import React from "react";
import { GRID_TEMPLATE, TEXT_COLORS } from "./constants";
import FilterDropdown from "@/components/common/FilterDropdown";
import { TYPE_OPTIONS } from "@/hooks/useFilter";

export const FilterComponent = React.memo(({
  filters,
  onJobFilterChange,
  onTypeFilterChange,
  jobOptions,
}) => (
  <div className="flex items-center justify-between gap-1 pb-4 sm:pb-6">
    <div className="flex w-full items-center justify-between gap-5 sm:justify-start">
      <FilterDropdown
        value={filters.job}
        onChange={onJobFilterChange}
        options={jobOptions}
        className="w-36"
      />
      <FilterDropdown
        value={filters.questionType}
        onChange={onTypeFilterChange}
        options={TYPE_OPTIONS}
        className="w-36"
      />
    </div>
  </div>
));

export const TableHeader = React.memo(() => (
  <div
    className={`mb-3 hidden items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 ${TEXT_COLORS.header} tracking-wide sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base`}
    style={{ gridTemplateColumns: GRID_TEMPLATE }}
  >
    <div className="text-start">No</div>
    <div className="pl-10 text-start">직무</div>
    <div className="pl-5 text-center">유형</div>
    <div className="pr-8 text-left">질문</div>
    <div className="flex justify-center">즐겨찾기</div>
  </div>
));
