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

const QuestionList = () => {
  const navigate = useNavigate();
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
      const data = await fetchInterviewsWithFirstQuestion(1, 1000, "date", undefined, true, userId);
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
          date: new Date(interview.createdAt).toISOString().slice(0, 10).replace(/-/g, "."),
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
      return [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, []);

  const updateVisibleResults = useCallback((resetPage = false) => {
    const sorted = sortResults(allQuestions, filters.type);
    const nextPage = resetPage ? 0 : page;
    const nextVisible = sorted.slice(0, (nextPage + 1) * SCROLL_BATCH_SIZE);
    setVisibleResults(nextVisible);
    setHasMore(nextVisible.length < sorted.length);
    if (resetPage) setPage(0);
  }, [allQuestions, filters.type, page, sortResults]);

  const handleFilterChange = useCallback((type) => {
    if (type === filters.type) return;
    setIsTransitioning(true);
    updateFilter("type", type);
    updateVisibleResults(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [filters.type, updateFilter, updateVisibleResults]);

  const loadMoreResults = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setPage((prev) => {
        const nextPage = prev + 1;
        const sorted = sortResults(allQuestions, filters.type);
        const nextVisible = sorted.slice(0, (nextPage + 1) * SCROLL_BATCH_SIZE);
        setVisibleResults(nextVisible);
        setHasMore(nextVisible.length < sorted.length);
        setLoading(false);
        return nextPage;
      });
    }, 300);
  }, [loading, hasMore, allQuestions, filters.type, sortResults]);

  const handleBookmarkToggle = useCallback(async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setAllQuestions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
        )
      );
    } catch (err) {
      setError("북마크 토글 실패");
    }
  }, []);

  const handleCardClick = useCallback((id) => {
    const item = visibleResults.find((item) => item.id === id);
    if (item?.interviewId) {
      navigate(`/interview-result/${item.interviewId}`);
    }
  }, [navigate, visibleResults]);

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
    if (loading || !hasMore) return;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreResults();
    }
  }, [loading, hasMore, loadMoreResults]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const isEmpty = visibleResults.length === 0 && !loading;

  return (
    <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
      <Header showDescription={visibleResults.length > 0} />

      {visibleResults.length > 0 && (
        <FilterBar
          filterValue={filters.type}
          onFilterChange={handleFilterChange}
          isDeleteMode={isDeleteMode}
          onDeleteToggle={() => setIsDeleteMode((v) => !v)}
          onDeleteConfirm={() => {}}
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
              isTransitioning ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
          >
            <ResultGrid
              visibleResults={visibleResults}
              isDeleteMode={isDeleteMode}
              selected={selected}
              handleSelectToggle={() => {}}
              handleBookmarkToggle={handleBookmarkToggle}
              handleCardClick={handleCardClick}
            />
          </div>

          {loading && <LoadingIndicator />}
          {!hasMore && !loading && visibleResults.length > 0 && (
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
          btnHandler={() => {}}
        />
      )}
    </div>
  );
};

export default QuestionList;
