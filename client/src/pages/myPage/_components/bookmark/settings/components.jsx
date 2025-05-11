import React from "react";
import { GRID_TEMPLATE, TEXT_COLORS } from "./constants";
import FilterDropdown from "@/components/common/FilterDropdown";
import { JOB_OPTIONS, TYPE_OPTIONS } from "@/components/common/useFilter";

export const FilterComponent = ({
  filters,
  onJobFilterChange,
  onTypeFilterChange,
}) => (
  <div className="flex items-center justify-between gap-1 pb-4 sm:pb-6">
    <div className="flex w-full items-center justify-between gap-5 sm:justify-start">
      <FilterDropdown
        value={filters.job}
        onChange={onJobFilterChange}
        options={JOB_OPTIONS}
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
);

export const TableHeader = () => (
  <div
    className={`mb-3 hidden items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 ${TEXT_COLORS.header} tracking-wide sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base`}
    style={{ gridTemplateColumns: GRID_TEMPLATE }}
  >
    <div className="text-start">No</div>
    <div className="pl-6 text-start">직무</div>
    <div className="text-center">유형</div>
    <div className="pl-4 text-left">질문</div>
    <div className="flex justify-center">즐겨찾기</div>
  </div>
);

export const LoadingIndicator = () => (
  <div className="my-6 flex justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

