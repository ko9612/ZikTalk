import React, { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import EmptyQuestionList from "./EmptyQuestionList";
import { Header, FilterBar, ResultGrid, LoadingIndicator } from "./settings";
import CommonModal from "@/components/common/Modal/CommonModal";
import { SCROLL_BATCH_SIZE } from "./settings/constants";
import axiosInstance from "@/api/axiosInstance";
import { batchDeleteInterviews } from "@/api/myPageApi";
import ResultCard from "@/components/common/ResultCard";

// 중복 제거 유틸 함수
function removeDuplicateById(arr) {
  const map = new Map();
  arr.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

const QuestionList = () => {
  const navigate = useNavigate();
  const { filters, updateFilter } = useFilter({ type: SORT_OPTIONS.LATEST });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);
  const [visibleResults, setVisibleResults] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState({});
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const loadingRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);

  const fetchData = useCallback(async (pageNum, isInitial = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await axiosInstance.get(`/interview/user`, {
        params: {
          page: pageNum,
          pageSize: SCROLL_BATCH_SIZE,
          sortBy: "date",
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.data) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

      // 응답 데이터 형식화
      const formattedQuestions = response.data.map((interview) => {
        return {
          id: interview.id,
          interviewId: interview.id,
          role: interview.role,
          type: interview.type,
          totalScore: interview.totalScore,
          createdAt: interview.createdAt,
          bookmarked: interview.bookmarked || false,
          summary: interview.summary,
          date: interview.createdAt
            ? new Date(interview.createdAt)
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, ".")
            : "",
        };
      });

      return {
        questions: formattedQuestions,
        hasMore: formattedQuestions.length >= SCROLL_BATCH_SIZE,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        return null;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchData(page, true);
        if (!result) return;

        setAllQuestions(result.questions);
        setVisibleResults(result.questions);
        setHasMore(result.hasMore);
        setInitialDataLoaded(true);
      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (!initialDataLoaded) {
      fetchInitialData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initialDataLoaded, page, fetchData]);

  const sortResults = useCallback((results, type) => {
    if (type === SORT_OPTIONS.BOOKMARK) {
      return [...results].sort((a, b) => {
        if (a.bookmarked !== b.bookmarked) {
          return a.bookmarked ? -1 : 1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      return [...results].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }
  }, []);

  const updateVisibleResults = useCallback(
    (resetPage = false) => {
      const sorted = sortResults(allQuestions, filters.type);
      const nextPage = resetPage ? 0 : page;
      const nextVisible = sorted.slice(0, (nextPage + 1) * SCROLL_BATCH_SIZE);
      setVisibleResults(nextVisible);
      setHasMore(nextVisible.length < sorted.length);
      if (resetPage) setPage(0);
    },
    [allQuestions, filters.type, page, sortResults],
  );

  const handleFilterChange = useCallback(
    async (type) => {
      if (type === filters.type) return;
      setIsTransitioning(true);
      setLoading(true);
      try {
        updateFilter("type", type);
        const result = await fetchData(1, true);
        if (!result) return;

        setAllQuestions(result.questions);
        setVisibleResults(result.questions);
        setHasMore(result.hasMore);
        setPage(1);
      } catch (err) {
        setError("필터링된 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }
    },
    [filters.type, updateFilter, fetchData],
  );

  const loadMoreResults = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchData(nextPage, false);
      if (!result) return;

      // 1초 인위적 딜레이 추가
      await new Promise((res) => setTimeout(res, 1000));

      setAllQuestions((prev) =>
        removeDuplicateById([...prev, ...result.questions]),
      );
      setVisibleResults((prev) =>
        removeDuplicateById([...prev, ...result.questions]),
      );
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError("추가 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, fetchData]);

  const handleSelectToggle = useCallback((id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleBookmarkToggle = useCallback(
    async (id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        const item = visibleResults.find((item) => item.id === id);
        if (!item) {
          return;
        }
        // PATCH 요청으로 북마크 토글
        const response = await axiosInstance.patch(
          `/interview/${id}/bookmark`,
          {
            bookmarked: !item.bookmarked,
          },
        );
        if (response.data) {
          setAllQuestions((prev) => {
            const next = prev.map((item) =>
              item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
            );
            return next;
          });
          setVisibleResults((prev) => {
            const next = prev.map((item) =>
              item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
            );
            return next;
          });
        }
      } catch (err) {
        setError("북마크 상태 변경에 실패했습니다.");
      }
    },
    [visibleResults],
  );

  const handleCardClick = useCallback(
    (id) => {
      const item = visibleResults.find((item) => item.id === id);
      if (item?.interviewId) {
        navigate(`/interview-result/${item.interviewId}`);
      }
    },
    [navigate, visibleResults],
  );

  useEffect(() => {
    if (!isDeleteMode) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsDeleteMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteMode]);

  useEffect(() => {
    updateVisibleResults();
  }, [allQuestions, filters.type, page, updateVisibleResults]);

  const handleScroll = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollHeight - scrollTop - clientHeight < 5) {
      loadMoreResults();
    }
  }, [loading, loadingMore, hasMore, loadMoreResults]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // 마우스 휠로 스크롤이 거의 없을 때도 loadMoreResults 호출
  useEffect(() => {
    const handleWheel = (e) => {
      if (
        document.documentElement.scrollHeight -
          document.documentElement.clientHeight <
          20 &&
        e.deltaY > -10 // 아래로 내릴 때만
      ) {
        loadMoreResults();
      }
    };
    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [loadMoreResults]);

  const isEmpty = visibleResults.length === 0 && !loading;

  // ResultGrid 컴포넌트에서 사용할 카드 렌더링 함수
  const renderCard = useCallback(
    (item) => (
      <ResultCard
        item={item}
        isDeleteMode={isDeleteMode}
        selected={selected}
        handleSelectToggle={handleSelectToggle}
        handleBookmarkToggle={handleBookmarkToggle}
        handleCardClick={handleCardClick}
      />
    ),
    [
      isDeleteMode,
      selected,
      handleSelectToggle,
      handleBookmarkToggle,
      handleCardClick,
    ],
  );

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const selectedIds = Object.entries(selected)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);

      if (selectedIds.length === 0) {
        setConfirmMessage("선택된 항목이 없습니다.");
        setConfirmModalOpen(true);
        return;
      }

      setConfirmMessage(
        `선택한 ${selectedIds.length}개의 면접을 삭제하시겠습니까?
        삭제된 데이터는 복구할 수 없습니다.`,
      );
      setConfirmModalOpen(true);
    } catch (error) {
      setError("삭제 처리 중 오류가 발생했습니다.");
    }
  }, [selected]);

  const handleDeleteExecute = useCallback(async () => {
    setDeleteSuccessModalOpen(true);
    try {
      const selectedIds = Object.entries(selected)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);

      await batchDeleteInterviews(selectedIds);
    } catch (error) {
    } finally {
      setConfirmModalOpen(false);
    }
  }, [selected]);

  return (
    <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
      <Header showDescription={true} />
      <FilterBar
        filterValue={filters.type}
        onFilterChange={handleFilterChange}
        isDeleteMode={isDeleteMode}
        onDeleteToggle={() => setIsDeleteMode((v) => !v)}
        onDeleteConfirm={handleDeleteConfirm}
      />

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
        </div>
      )}

      <div
        className={`transition-all duration-300 ease-in-out ${
          isTransitioning ? "scale-[0.98] opacity-50" : "scale-100 opacity-100"
        }`}
        style={{ minHeight: "10vh", position: "relative" }}
      >
        {loading ? (
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <LoadingIndicator />
          </div>
        ) : visibleResults.length === 0 ? (
          <EmptyQuestionList />
        ) : (
          <ResultGrid
            visibleResults={visibleResults}
            isDeleteMode={isDeleteMode}
            selected={selected}
            handleSelectToggle={handleSelectToggle}
            handleBookmarkToggle={handleBookmarkToggle}
            handleCardClick={handleCardClick}
            renderCard={renderCard}
          />
        )}
      </div>

      {loadingMore && (
        <div
          className="my-10 flex w-full justify-center"
          style={{ minHeight: 60 }}
        >
          <LoadingIndicator />
        </div>
      )}

      {!hasMore && !loading && !loadingMore && visibleResults.length > 0 && (
        <div className="scroll-spacer my-10 h-2 w-full">
          <div className="text-zik-text/60 my-10 flex w-full items-center justify-center text-sm">
            더 이상 불러올 데이터가 없습니다
          </div>
        </div>
      )}

      {confirmModalOpen && (
        <CommonModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="삭제 확인"
          subText={
            <span style={{ whiteSpace: "pre-line" }}>{confirmMessage}</span>
          }
          btnText="삭제하기"
          btnHandler={handleDeleteExecute}
          className="break-keep whitespace-pre-wrap"
        />
      )}

      {deleteSuccessModalOpen && (
        <CommonModal
          isOpen={deleteSuccessModalOpen}
          onClose={() => {
            setDeleteSuccessModalOpen(false);
            window.location.reload();
          }}
          title="삭제 완료"
          subText="정상적으로 삭제되었습니다."
          btnText="확인"
          btnHandler={() => {
            setDeleteSuccessModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default QuestionList;
