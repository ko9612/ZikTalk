import React, { useEffect, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import EmptyQuestionList from "./EmptyQuestionList";
import {
  Header,
  FilterBar,
  ResultGrid,
  LoadingIndicator,
  ScrollPrompt,
} from "./settings";
import { loginInfo } from "@/store/loginStore";
import CommonModal from "@/components/common/Modal/CommonModal";
import { SCROLL_BATCH_SIZE } from "./settings/constants";
import { fetchInterviewsWithFirstQuestion } from "@/api/myPageApi";
import { useToast } from "@/hooks/useToast";

const QuestionList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { filters, updateFilter } = useFilter({ type: SORT_OPTIONS.LATEST });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const userId = loginInfo((state) => state.userId);
  const loginState = loginInfo((state) => state.loginState);
  const [allQuestions, setAllQuestions] = useState([]);
  const [visibleResults, setVisibleResults] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState({});
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [error, setError] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedResults, setDisplayedResults] = useState([]);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const fetchAllQuestions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInterviewsWithFirstQuestion(
        1,
        1000,
        "date",
        undefined,
        true,
        userId,
      );
      if (!data) throw new Error("데이터를 불러올 수 없습니다.");
      const formatted = data.map((interview, index) => {
        const firstQuestion = interview.questions?.[0] || null;
        return {
          id: `${interview.id}-${index}`,
          originalId: interview.id,
          interviewId: interview.id,
          title: interview.role || "미분류",
          content: firstQuestion?.content || "",
          answer: firstQuestion?.myAnswer || "",
          recommendation: firstQuestion?.recommended || "",
          score: interview.totalScore || 0,
          desc: "score",
          date: new Date(interview.createdAt)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "."),
          createdAt: interview.createdAt,
          type: firstQuestion?.type === "PERSONALITY" ? "인성" : "직무",
          bookmarked: interview.bookmarked || false,
          interviewData: interview,
          userId: interview.userId || userId,
          summary: interview.summary || "",
        };
      });
      setAllQuestions(formatted);
    } catch (err) {
      setError("데이터 로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  // 필터/정렬 적용 후 visibleResults 계산
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

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (type) => {
      if (type === filters.type) return;
      setIsTransitioning(true);
      updateFilter("type", type);
      updateVisibleResults(true);
      // 애니메이션 완료 후 상태 초기화
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [filters.type, updateFilter, updateVisibleResults],
  );

  const loadMoreResults = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => {
        const nextPage = prev + 1;
        const sorted = sortResults(allQuestions, filters.type);
        const nextVisible = sorted.slice(0, (nextPage + 1) * SCROLL_BATCH_SIZE);
        setVisibleResults(nextVisible);
        setHasMore(nextVisible.length < sorted.length);
        setLoadingMore(false);
        return nextPage;
      });
    }, 300);
  }, [loading, loadingMore, hasMore, allQuestions, filters.type, sortResults]);

  const handleBookmarkToggle = useCallback(async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setAllQuestions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
        ),
      );
    } catch (err) {
      setError("북마크 토글 실패");
    }
  }, []);

  // 카드 클릭 핸들러
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
    if (!initialDataLoaded && loginState && userId) {
      fetchAllQuestions().then(() => {
        setInitialDataLoaded(true);
      });
    }
  }, [initialDataLoaded, fetchAllQuestions, loginState, userId]);

  useEffect(() => {
    updateVisibleResults();
  }, [allQuestions, filters.type, page, updateVisibleResults]);

  const handleScroll = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreResults();
    }
  }, [loading, loadingMore, hasMore, loadMoreResults]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const isEmpty = visibleResults.length === 0 && !loading;

  const handleSelectToggle = useCallback((id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    const selectedIds = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      showToast("삭제할 항목을 선택해주세요.", "error");
      return;
    }

    try {
      setLoading(true);
      // 선택된 항목들의 originalId를 찾아서 삭제
      const selectedOriginalIds = selectedIds.map(id => {
        const item = allQuestions.find(q => q.id === id);
        return item?.originalId;
      }).filter(Boolean);

      // 여기에 실제 API 호출 코드 추가 필요
      // await deleteInterviews(selectedOriginalIds);

      // 로컬 상태 업데이트
      setAllQuestions(prev => prev.filter(q => !selectedIds.includes(q.id)));
      setSelected({});
      setIsDeleteMode(false);
      showToast("선택한 항목이 삭제되었습니다.", "success");
    } catch (error) {
      showToast("삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
    }
  }, [selected, allQuestions, showToast]);

  const handleDeleteButtonClick = useCallback(() => {
    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (selectedCount === 0) {
      showToast("삭제할 항목을 선택해주세요.", "error");
      return;
    }
    setConfirmMessage(`선택한 ${selectedCount}개의 항목을 삭제하시겠습니까?`);
    setConfirmModalOpen(true);
  }, [selected, showToast]);

  return (
    <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
      <Header showDescription={visibleResults.length > 0} />

      {visibleResults.length > 0 && (
        <FilterBar
          filterValue={filters.type}
          onFilterChange={handleFilterChange}
          isDeleteMode={isDeleteMode}
          onDeleteToggle={() => setIsDeleteMode((v) => !v)}
          onDeleteConfirm={handleDeleteButtonClick}
        />
      )}

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
        </div>
      )}

      {isEmpty ? (
        <EmptyQuestionList />
      ) : (
        <>
          <div
            className={`transition-all duration-300 ease-in-out ${
              isTransitioning
                ? "scale-[0.98] opacity-50"
                : "scale-100 opacity-100"
            }`}
          >
            {!loading ? (
              <ResultGrid
                visibleResults={visibleResults}
                isDeleteMode={isDeleteMode}
                selected={selected}
                handleSelectToggle={handleSelectToggle}
                handleBookmarkToggle={handleBookmarkToggle}
                handleCardClick={handleCardClick}
              />
            ) : (
              <div className="h-28 w-full" />
            )}
          </div>

          {loading && <LoadingIndicator />}
          
          {loadingMore && (
            <div 
              className="my-4 flex w-full justify-center" 
              ref={loadingRef}
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
        </>
      )}

      {confirmModalOpen && (
        <CommonModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="삭제 확인"
          subText={confirmMessage}
          btnText="삭제하기"
          btnHandler={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default QuestionList;
