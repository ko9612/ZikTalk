import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { fetchBookmarks, toggleQuestionBookmark } from "@/api/myPageApi";
import { useToast } from "@/hooks/useToast";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  TableHeader,
  LoadingIndicator,
} from "./settings";
import FaqItem from "@/components/common/FaqItem";
import Pagination from "@/components/common/Pagination";
import FilterDropdown from "@/components/common/FilterDropdown";

// 로딩 스피너 컴포넌트 추가
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-4">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
  </div>
);

// 북마크 질문 목록 상태 관리 훅
const useBookmarkListState = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [allResults, setAllResults] = useState([]); // 모든 북마크 데이터
  const [allFiltered, setAllFiltered] = useState([]); // 전체 필터링된 데이터
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);

  // 전체 북마크 데이터 받아오기 (한 번만 호출)
  const fetchAllBookmarkedQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 필터 없이 전체 데이터 받아오기 (최대 200개)
      const response = await fetchBookmarks(1, 200, undefined, undefined);
      if (!response || !response.questions) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

      const formattedQuestions = response.questions.map((q) => ({
        id: q.id,
        career: q.role || q.interview?.role || "미분류",
        type: q.type === "JOB" ? "직무" : "인성",
        question: q.content,
        answer: q.myAnswer,
        recommendation: q.recommended,
        bookmarked: q.bookmarked,
        interviewId: q.interviewId,
      }));

      setAllResults(formattedQuestions);
      // 초기 필터링된 결과는 전체 데이터와 동일
      setAllFiltered(formattedQuestions);

      // 첫 페이지 설정
      const paged = formattedQuestions.slice(0, PAGE_SIZE);
      setVisibleResults(paged);
      setTotalPages(Math.ceil(formattedQuestions.length / PAGE_SIZE));
      setCurrentPage(1);
    } catch (error) {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 필터 적용 - 클라이언트 사이드에서 필터링
  const applyFilters = useCallback(
    (currentFilters) => {
      setLoading(true);

      // 필터 조건 확인
      const hasJobFilter = currentFilters.job !== "직군·직무";
      const hasTypeFilter = currentFilters.questionType !== "질문유형";

      // 전체 데이터에서 필터링
      let filtered = [...allResults];

      // 직군·직무 필터 적용
      if (hasJobFilter) {
        filtered = filtered.filter(
          (item) => item.career === currentFilters.job,
        );
      }

      // 질문유형 필터 적용
      if (hasTypeFilter) {
        filtered = filtered.filter((item) =>
          currentFilters.questionType === "직무"
            ? item.type === "직무"
            : item.type === "인성",
        );
      }

      // 필터링된 결과 저장
      setAllFiltered(filtered);

      // 페이지네이션 적용 (항상 1페이지로 리셋)
      const paged = filtered.slice(0, PAGE_SIZE);
      setVisibleResults(paged);
      setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
      setCurrentPage(1);

      setLoading(false);
    },
    [allResults],
  );

  // 페이지 변경 처리
  const handlePageChange = useCallback(
    (pageNum) => {
      const startIndex = (pageNum - 1) * PAGE_SIZE;
      const paged = allFiltered.slice(startIndex, startIndex + PAGE_SIZE);
      setVisibleResults(paged);
      setCurrentPage(pageNum);
    },
    [allFiltered],
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchAllBookmarkedQuestions();
  }, [fetchAllBookmarkedQuestions]);

  // 북마크 토글
  const toggleBookmark = useCallback(
    async (id) => {
      try {
        // 현재 북마크 상태 확인 후 반대 값 계산
        const itemToToggle = visibleResults.find((q) => q.id === id);
        if (!itemToToggle) return false;

        const newBookmarkState = !itemToToggle.bookmarked;

        setVisibleResults((prev) => {
          const index = prev.findIndex((q) => q.id === id);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            bookmarked: newBookmarkState,
          };
          return updated;
        });

        // 계산된 새로운 북마크 상태 전달
        await toggleQuestionBookmark(id, newBookmarkState);

        // 북마크가 해제된 경우에만 목록에서 제거
        if (!newBookmarkState) {
          setAllResults((prev) => prev.filter((q) => q.id !== id));
          setAllFiltered((prev) => prev.filter((q) => q.id !== id));

          // 필요하면 페이지 재계산
          if (visibleResults.length <= 1 && currentPage > 1) {
            handlePageChange(currentPage - 1);
          } else {
            handlePageChange(currentPage);
          }
        }

        return true;
      } catch (err) {
        setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);

        // 실패시 상태 원복
        setVisibleResults((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
          ),
        );

        return false;
      }
    },
    [visibleResults, currentPage, handlePageChange],
  );

  // 확장 토글
  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  }, []);

  return {
    state: {
      currentPage,
      totalPages,
      visibleResults,
      loading,
      error,
      openIds,
    },
    fetchAllBookmarkedQuestions,
    applyFilters,
    handlePageChange,
    toggleBookmark,
    toggleOpen,
    setLoading,
    setError,
    setVisibleResults,
    setCurrentPage,
  };
};

const QuestionBookmarkList = ({ testEmpty }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  const {
    state,
    applyFilters, // 변경된 함수
    handlePageChange, // 페이지 변경 함수 직접 사용
    toggleBookmark,
    toggleOpen,
  } = useBookmarkListState();

  const { currentPage, totalPages, visibleResults, loading, error, openIds } =
    state;

  const [dynamicJobOptions, setDynamicJobOptions] = useState([
    { value: "직군·직무", label: "직군·직무" },
  ]);

  // 모든 사용 가능한 직군/직무 옵션을 저장
  const [allAvailableJobOptions, setAllAvailableJobOptions] = useState([]);
  const [isJobOptionsLoaded, setIsJobOptionsLoaded] = useState(false);

  // 모든 가능한 직군·직무 옵션을 로드하는 함수
  const loadAllJobOptions = useCallback(async () => {
    if (isJobOptionsLoaded) return;

    try {
      // 기본 옵션 항상 포함
      const defaultOption = { value: "직군·직무", label: "직군·직무" };

      // 이미 로드된 옵션이 있으면 사용
      if (allAvailableJobOptions.length > 1) {
        setDynamicJobOptions([defaultOption, ...allAvailableJobOptions]);
        return;
      }

      // 필터 없이 북마크 데이터 로드 시도
      try {
        const response = await fetchBookmarks(1, 100, undefined, undefined);

        if (response && response.questions && response.questions.length > 0) {
          // 모든 직군·직무 값 추출 (interview.role만 사용)
          const allRoles = response.questions
            .map((q) => q.interview?.role)
            .filter(Boolean);

          // 중복 제거
          const uniqueRoles = Array.from(new Set(allRoles));

          // 옵션 변환 및 저장
          const roleOptions = uniqueRoles.map((role) => ({
            value: role,
            label: role,
          }));
          setAllAvailableJobOptions(roleOptions);
          setDynamicJobOptions([defaultOption, ...roleOptions]);
          setIsJobOptionsLoaded(true);
        }
      } catch (err) {
        // 오류 발생 시 기본 옵션만 유지
        setDynamicJobOptions([defaultOption]);
      }
    } catch (err) {}
  }, [allAvailableJobOptions, isJobOptionsLoaded]);

  // 컴포넌트 마운트 시 한 번만 직군·직무 옵션 로드
  useEffect(() => {
    if (!isJobOptionsLoaded) {
      loadAllJobOptions();
    }
  }, [isJobOptionsLoaded, loadAllJobOptions]);

  // 북마크 데이터가 변경될 때 현재 필터링된 결과에 없는 옵션도 유지
  useEffect(() => {
    if (allAvailableJobOptions.length > 0) {
      setDynamicJobOptions([
        { value: "직군·직무", label: "직군·직무" },
        ...allAvailableJobOptions,
      ]);
    }
  }, [allAvailableJobOptions]);

  // 질문 유형 옵션
  const questionTypeOptions = [
    { value: "질문유형", label: "질문유형" },
    { value: "직무", label: "직무" },
    { value: "인성", label: "인성" },
  ];

  // 필터 변경 핸들러 - job
  const handleJobFilterChange = useCallback(
    (value) => {
      updateFilter("job", value);
      applyFilters({ ...filters, job: value });
    },
    [updateFilter, applyFilters, filters],
  );

  // 필터 변경 핸들러 - questionType
  const handleTypeFilterChange = useCallback(
    (value) => {
      updateFilter("questionType", value);
      applyFilters({ ...filters, questionType: value });
    },
    [updateFilter, applyFilters, filters],
  );

  // 페이지네이션 핸들러도 훅의 함수 사용
  const onPageChange = useCallback(
    (pageNum) => {
      handlePageChange(pageNum);
    },
    [handlePageChange],
  );

  const isEmpty = visibleResults.length === 0 && !loading;

  return (
    <div className="mx-auto w-full pt-6">
      <h2
        className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}
      >
        질문 북마크
      </h2>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <FilterDropdown
            value={filters.job}
            onChange={handleJobFilterChange}
            options={dynamicJobOptions}
            className="text-gray-500"
            buttonWidth="flex mr-14 h-10 w-36  gap-5 items-center justify-between truncate  border border-gray-300 bg-white text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-3  sm:py-4 sm:px-3 sm:text-sm"
            dropdownWidth="w-36"
          />

          <FilterDropdown
            value={filters.questionType}
            onChange={handleTypeFilterChange}
            options={questionTypeOptions}
            className="text-gray-500"
            buttonWidth="flex h-10 w-36 gap-5 items-center justify-between truncate border border-gray-300 bg-white text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-3 sm:py-4 sm:px-3 sm:text-sm"
            dropdownWidth="w-36"
          />
        </div>
      </div>

      {isEmpty ? (
        <EmptyBookmarkList
          job={filters.job}
          setJob={handleJobFilterChange}
          type={filters.questionType}
          setType={handleTypeFilterChange}
          isCareerModalOpen={false}
          setCareerModalOpen={() => {}}
        />
      ) : (
        <>
          <TableHeader />

          <div className="relative mb-4 h-full min-h-[100px] overflow-y-hidden rounded-lg">
            {loading && visibleResults.length === 0 ? (
              <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <LoadingIndicator />
              </div>
            ) : (
              <div className="h-full p-2">
                {visibleResults.map((item, index) => (
                  <div key={item.id}>
                    <FaqItem
                      id={item.id}
                      displayId={index + 1}
                      career={item.career}
                      type={item.type}
                      question={item.question}
                      answer={item.answer}
                      recommendation={item.recommendation}
                      isExpanded={openIds.includes(item.id)}
                      onToggle={() => toggleOpen(item.id)}
                      isStarred={item.bookmarked}
                      onStarToggle={() => handleBookmarkToggle(item.id)}
                      textColors={TEXT_COLORS}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 페이지네이션 컴포넌트는 항상 카드 리스트 하단에 위치 */}
          {!isEmpty && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
