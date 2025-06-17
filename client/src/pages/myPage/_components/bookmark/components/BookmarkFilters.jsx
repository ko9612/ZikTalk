import React, { useState, useEffect } from "react";
import FilterDropdown from "@/components/common/FilterDropdown";

const BookmarkFilters = ({ filters, onFilterChange, allResults }) => {
  const [dynamicJobOptions, setDynamicJobOptions] = useState([
    { value: "직군·직무", label: "직군·직무" },
  ]);

  useEffect(() => {
    if (allResults.length > 0) {
      const uniqueRoles = Array.from(
        new Set(allResults.map((item) => item.career)),
      ).filter((role) => role !== "미분류");

      const roleOptions = uniqueRoles.map((role) => ({
        value: role,
        label: role,
      }));

      setDynamicJobOptions([
        { value: "직군·직무", label: "직군·직무" },
        ...roleOptions,
      ]);
    }
  }, [allResults]);

  const questionTypeOptions = [
    { value: "질문유형", label: "질문유형" },
    { value: "직무", label: "직무" },
    { value: "인성", label: "인성" },
  ];

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex space-x-2">
        <FilterDropdown
          value={filters.job}
          onChange={(value) => onFilterChange({ ...filters, job: value })}
          options={dynamicJobOptions}
          className="text-gray-500"
          buttonWidth="flex h-10 w-40 items-center justify-between border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-3 sm:py-4 sm:px-3 sm:text-sm"
          dropdownWidth="w-40"
        />

        <FilterDropdown
          value={filters.questionType}
          onChange={(value) => onFilterChange({ ...filters, questionType: value })}
          options={questionTypeOptions}
          className="ml-10 text-gray-500"
          buttonWidth="flex h-10 w-40 items-center justify-between border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-3 sm:py-4 sm:px-3 sm:text-sm"
          dropdownWidth="w-40"
        />
      </div>
    </div>
  );
};

export default BookmarkFilters; 