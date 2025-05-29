import React, { useEffect, useCallback, useState } from "react";
import { useFilter } from "@/hooks/useFilter";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { fetchBookmarks, toggleQuestionBookmark } from "@/api/myPageApi";
import { PAGE_SIZE, TEXT_COLORS, TableHeader } from "./settings";
import { LoadingIndicator } from "../common/LoadingIndicator";
import FaqItem from "@/components/common/FaqItem";
import Pagination from "@/components/common/Pagination";
import FilterDropdown from "@/components/common/FilterDropdown";
import Error500 from "@/components/common/Error500";

// 북마크 질문 목록 상태 관리 훅
const useBookmarkListState = (filters) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [allResults, setAllResults] = useState([]); // 전체 데이터 저장
  const [filteredResults, setFilteredResults] = useState([]); // 필터링된 데이터 저장
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);
  const [fetchError, setFetchError] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 전체 데이터 수 확인
        const response = await fetchBookmarks(1, 1);
        
        // 데이터가 없는 경우
        if (!response || !response.totalCount || response.totalCount === 0) {
          setAllResults([]);
          setFilteredResults([]);
          setVisibleResults([]);
          setTotalPages(0);
          setCurrentPage(1);
          return;
        }

        const totalCount = response.totalCount;

        // 첫 페이지 데이터만 먼저 요청
        const firstPageResponse = await fetchBookmarks(1, PAGE_SIZE);
        
        if (!firstPageResponse || !firstPageResponse.questions) {
          throw new Error("서버 응답 형식이 올바르지 않습니다.");
        }

        const firstPageQuestions = firstPageResponse.questions.map((q) => ({
          id: q.id,
          career: q.role || q.interview?.role || "미분류",
          type: q.type === "JOB" ? "직무" : "인성",
          question: q.content,
          answer: q.myAnswer,
          recommendation: q.recommended,
          bookmarked: q.bookmarked,
          interviewId: q.interviewId,
        }));

        // 첫 페이지 데이터로 초기 상태 설정
        setAllResults(firstPageQuestions);
        setFilteredResults(firstPageQuestions);
        setVisibleResults(firstPageQuestions);
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
        setCurrentPage(1);

        // 나머지 데이터는 백그라운드에서 로드
        if (totalCount > PAGE_SIZE) {
          const remainingPages = Math.ceil((totalCount - PAGE_SIZE) / PAGE_SIZE);
          const remainingPromises = [];

          for (let i = 2; i <= remainingPages + 1; i++) {
            remainingPromises.push(fetchBookmarks(i, PAGE_SIZE));
          }

          const remainingResponses = await Promise.all(remainingPromises);
          const remainingQuestions = remainingResponses
            .flatMap(response => response.questions)
            .map(q => ({
              id: q.id,
              career: q.role || q.interview?.role || "미분류",
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked,
              interviewId: q.interviewId,
            }));

          // 전체 데이터 업데이트
          setAllResults(prev => [...prev, ...remainingQuestions]);
          
          // 필터링된 결과 업데이트
          const allQuestions = [...firstPageQuestions, ...remainingQuestions];
          const filtered = allQuestions.filter((item) => {
            const matchesJob =
              filters.job === "직군·직무" || item.career === filters.job;
            const matchesType =
              filters.questionType === "질문유형" ||
              item.type === filters.questionType;
            return matchesJob && matchesType;
          });
          
          setFilteredResults(filtered);
        }
      } catch (error) {
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // 컴포넌트 마운트 시에만 실행

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (newFilters) => {
      try {
        setLoading(true);

        // allResults에서 필터링
        const filtered = allResults.filter((item) => {
          const matchesJob =
            newFilters.job === "직군·직무" || item.career === newFilters.job;
          const matchesType =
            newFilters.questionType === "질문유형" ||
            item.type === newFilters.questionType;
          return matchesJob && matchesType;
        });

        setFilteredResults(filtered);

        // 첫 페이지 데이터 표시
        const pageData = filtered.slice(0, PAGE_SIZE);
        setVisibleResults(pageData);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        setCurrentPage(1);
      } catch (error) {
        console.error("필터 변경 중 에러:", error);
        setError("필터 적용 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [allResults],
  );

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (pageNum) => {
      try {
        setLoading(true);

        // filteredResults에서 현재 페이지 데이터 추출
        const startIndex = (pageNum - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const pageData = filteredResults.slice(startIndex, endIndex);

        setVisibleResults(pageData);
        setCurrentPage(pageNum);
      } catch (error) {
        console.error("페이지 변경 중 에러:", error);
        setError("페이지 로딩 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [filteredResults],
  );

  // 북마크 토글
  const toggleBookmark = useCallback(
    async (id) => {
      try {
        const itemToToggle = visibleResults.find((q) => q.id === id);
        if (!itemToToggle) return false;

        const newBookmarkState = !itemToToggle.bookmarked;

        // UI 상태 업데이트
        setVisibleResults((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, bookmarked: newBookmarkState } : item,
          ),
        );

        // 전체 데이터 상태 업데이트
        setAllResults((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, bookmarked: newBookmarkState } : item,
          ),
        );

        // 서버에 북마크 상태 변경 요청
        await toggleQuestionBookmark(id, newBookmarkState);

        // 북마크가 해제된 경우 목록에서 제거
        if (!newBookmarkState) {
          // 현재 페이지의 항목 수가 PAGE_SIZE보다 작아질 경우
          if (visibleResults.length <= PAGE_SIZE) {
            // 다음 페이지의 항목을 가져옴
            const nextPageStartIndex = currentPage * PAGE_SIZE;
            const nextPageEndIndex = nextPageStartIndex + PAGE_SIZE;
            const nextPageItems = filteredResults.slice(
              nextPageStartIndex,
              nextPageEndIndex,
            );

            // 현재 페이지에서 북마크 해제된 항목 제거
            const updatedVisibleResults = visibleResults.filter(
              (q) => q.id !== id,
            );

            // 다음 페이지의 항목을 현재 페이지에 추가
            const newVisibleResults = [
              ...updatedVisibleResults,
              ...nextPageItems,
            ].slice(0, PAGE_SIZE);

            setVisibleResults(newVisibleResults);
          } else {
            setVisibleResults((prev) => prev.filter((q) => q.id !== id));
          }

          setFilteredResults((prev) => prev.filter((q) => q.id !== id));
          setAllResults((prev) => prev.filter((q) => q.id !== id));
        }

        return true;
      } catch (err) {
        setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
        return false;
      }
    },
    [visibleResults, currentPage, filteredResults],
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
      allResults,
    },
    toggleBookmark,
    toggleOpen,
    handleFilterChange,
    handlePageChange,
    setLoading,
    setError,
    setVisibleResults,
    setCurrentPage,
    fetchError,
  };
};

const QuestionBookmarkList = () => {
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  const {
    state,
    toggleBookmark,
    toggleOpen,
    handleFilterChange,
    handlePageChange,
    fetchError,
  } = useBookmarkListState(filters);

  const {
    currentPage,
    totalPages,
    visibleResults,
    loading,
    openIds,
    allResults,
  } = state;

  // 직군/직무 옵션을 현재 데이터에서 추출
  const [dynamicJobOptions, setDynamicJobOptions] = useState([
    { value: "직군·직무", label: "직군·직무" },
  ]);

  // 데이터가 변경될 때마다 직군/직무 옵션 업데이트
  useEffect(() => {
    if (allResults.length > 0) {
      // 전체 데이터에서 고유한 직군/직무 값 추출
      const uniqueRoles = Array.from(
        new Set(allResults.map((item) => item.career)),
      ).filter((role) => role !== "미분류");

      // 옵션 변환
      const roleOptions = uniqueRoles.map((role) => ({
        value: role,
        label: role,
      }));

      // 기본 옵션과 함께 설정
      setDynamicJobOptions([
        { value: "직군·직무", label: "직군·직무" },
        ...roleOptions,
      ]);
    }
  }, [allResults]);

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
      handleFilterChange({ ...filters, job: value });
    },
    [updateFilter, handleFilterChange, filters],
  );

  // 필터 변경 핸들러 - questionType
  const handleTypeFilterChange = useCallback(
    (value) => {
      updateFilter("questionType", value);
      handleFilterChange({ ...filters, questionType: value });
    },
    [updateFilter, handleFilterChange, filters],
  );

  const isEmpty = visibleResults.length === 0 && !loading;

  return (
    <>
      {fetchError ? (
        <Error500 />
      ) : (
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
                buttonWidth="flex h-10 w-40 items-center justify-between border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-3 sm:py-4 sm:px-3 sm:text-sm"
                dropdownWidth="w-40"
              />

              <FilterDropdown
                value={filters.questionType}
                onChange={handleTypeFilterChange}
                options={questionTypeOptions}
                className="ml-10 text-gray-500"
                buttonWidth="flex h-10 w-40 items-center justify-between border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-3 sm:py-4 sm:px-3 sm:text-sm"
                dropdownWidth="w-40"
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
                          displayId={(currentPage - 1) * PAGE_SIZE + index + 1}
                          career={item.career}
                          type={item.type}
                          question={item.question}
                          answer={item.answer}
                          recommendation={item.recommendation}
                          isExpanded={openIds.includes(item.id)}
                          onToggle={() => toggleOpen(item.id)}
                          isStarred={item.bookmarked}
                          onStarToggle={() => toggleBookmark(item.id)}
                          textColors={TEXT_COLORS}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* 페이지네이션 컴포넌트는 항상 카드 리스트 하단에 위치 */}
              {!isEmpty && (
                <>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default QuestionBookmarkList;
