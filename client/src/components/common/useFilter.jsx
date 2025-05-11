import { useState } from 'react';

export const SORT_OPTIONS = {
  LATEST: '최신순',
  BOOKMARK: '즐겨찾기',
};

export const useFilter = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    updateFilter,
    resetFilters
  };
};

export const JOB_OPTIONS = [
  { value: "직군·직무", label: "직군·직무" },
  { value: "프론트엔드 개발자", label: "프론트엔드 개발자" },
  { value: "백엔드 개발자", label: "백엔드 개발자" },
];

export const TYPE_OPTIONS = [
  { value: "질문유형", label: "질문유형" },
  { value: "인성", label: "인성" },
  { value: "직무", label: "직무" },
]; 