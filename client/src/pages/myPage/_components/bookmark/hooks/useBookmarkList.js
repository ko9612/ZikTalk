import { useState, useEffect, useCallback } from "react";
import { fetchBookmarks, toggleQuestionBookmark } from "@/api/myPageApi";
import { PAGE_SIZE } from "../settings";

export const useBookmarkList = (filters) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchBookmarks(1, 1);

        if (!response || !response.totalCount || response.totalCount === 0) {
          setAllResults([]);
          setFilteredResults([]);
          setVisibleResults([]);
          setTotalPages(0);
          setCurrentPage(1);
          return;
        }

        const totalCount = response.totalCount;
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

        setAllResults(firstPageQuestions);
        setFilteredResults(firstPageQuestions);
        setVisibleResults(firstPageQuestions);
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
        setCurrentPage(1);

        if (totalCount > PAGE_SIZE) {
          const remainingPages = Math.ceil((totalCount - PAGE_SIZE) / PAGE_SIZE);
          const remainingPromises = [];

          for (let i = 2; i <= remainingPages + 1; i++) {
            remainingPromises.push(fetchBookmarks(i, PAGE_SIZE));
          }

          const remainingResponses = await Promise.all(remainingPromises);
          const remainingQuestions = remainingResponses
            .flatMap((response) => response.questions)
            .map((q) => ({
              id: q.id,
              career: q.role || q.interview?.role || "미분류",
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked,
              interviewId: q.interviewId,
            }));

          setAllResults((prev) => [...prev, ...remainingQuestions]);

          const allQuestions = [...firstPageQuestions, ...remainingQuestions];
          const filtered = allQuestions.filter((item) => {
            const matchesJob = filters.job === "직군·직무" || item.career === filters.job;
            const matchesType = filters.questionType === "질문유형" || item.type === filters.questionType;
            return matchesJob && matchesType;
          });

          setFilteredResults(filtered);
        }
      } catch (error) {
        setError("데이터를 불러오는데 실패했습니다.");
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = useCallback(
    (newFilters) => {
      try {
        setLoading(true);
        const filtered = allResults.filter((item) => {
          const matchesJob = newFilters.job === "직군·직무" || item.career === newFilters.job;
          const matchesType = newFilters.questionType === "질문유형" || item.type === newFilters.questionType;
          return matchesJob && matchesType;
        });

        setFilteredResults(filtered);
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

  const handlePageChange = useCallback(
    (pageNum) => {
      try {
        setLoading(true);
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

  const toggleBookmark = useCallback(
    async (id) => {
      try {
        const itemToToggle = visibleResults.find((q) => q.id === id);
        if (!itemToToggle) return false;

        const newBookmarkState = !itemToToggle.bookmarked;

        setVisibleResults((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, bookmarked: newBookmarkState } : item,
          ),
        );

        setAllResults((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, bookmarked: newBookmarkState } : item,
          ),
        );

        await toggleQuestionBookmark(id, newBookmarkState);

        if (!newBookmarkState) {
          if (visibleResults.length <= PAGE_SIZE) {
            const nextPageStartIndex = currentPage * PAGE_SIZE;
            const nextPageEndIndex = nextPageStartIndex + PAGE_SIZE;
            const nextPageItems = filteredResults.slice(
              nextPageStartIndex,
              nextPageEndIndex,
            );

            const updatedVisibleResults = visibleResults.filter(
              (q) => q.id !== id,
            );

            const newVisibleResults = [
              ...updatedVisibleResults,
              ...nextPageItems,
            ].slice(0, PAGE_SIZE);

            setVisibleResults(newVisibleResults);
          } else {
            setVisibleResults((prev) => prev.filter((q) => q.id !== id));
          }

          setFilteredResults((prev) => {
            const newFiltered = prev.filter((q) => q.id !== id);
            const newTotalPages = Math.ceil(newFiltered.length / PAGE_SIZE);
            setTotalPages(newTotalPages);

            if (currentPage > newTotalPages) {
              setCurrentPage(newTotalPages);
            }

            return newFiltered;
          });

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