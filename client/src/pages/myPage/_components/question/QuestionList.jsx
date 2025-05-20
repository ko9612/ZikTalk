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
import {
  batchDeleteInterviews,
  toggleInterviewBookmark,
} from "@/api/myPageApi";
import { useToast } from "@/hooks/useToast";
import axiosInstance from "@/api/axiosInstance";
const serverUrl = import.meta.env.VITE_SERVER_URL;
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
      const response = await axiosInstance.get(
        `${serverUrl}/interview/user/${userId}`,
      );

      const interviews = response.data;

      if (!interviews) {
        throw new Error("데이터를 불러올 수 없습니다.");
      }

      const formatted = interviews.map((interview, index) => ({
        id: `${interview.id}-${index}`,
        originalId: interview.id,
        interviewId: interview.id,
        title: interview.role || "미분류",
        content: interview.questions?.[0]?.content || "",
        answer: interview.questions?.[0]?.myAnswer || "",
        recommendation: interview.questions?.[0]?.recommended || "",
        score: interview.totalScore || 0,
        desc: "score",
        date: new Date(interview.createdAt)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "."),
        createdAt: interview.createdAt,
        type:
          interview.questions?.[0]?.type === "PERSONALITY" ? "인성" : "직무",
        bookmarked: interview.bookmarked || false,
        interviewData: interview,
        userId: interview.userId || userId,
        summary: interview.summary || "",
      }));

      setAllQuestions(formatted);
    } catch (error) {
      console.error("[면접 결과 조회 실패]", error);
      const errorMessage =
        error.response?.status === 401
          ? "로그인이 필요합니다."
          : "데이터를 불러오는데 실패했습니다.";
      setError(errorMessage);
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

    console.log("[스크롤] 데이터 로드 중...");
    setLoadingMore(true);

    // 다음 페이지 데이터 계산
    const nextPage = page + 1;
    const sorted = sortResults(allQuestions, filters.type);
    const nextVisible = sorted.slice(0, (nextPage + 1) * SCROLL_BATCH_SIZE);

    // 지연 시간을 300ms로 설정하여 부드러운 로딩 효과
    setTimeout(() => {
      setPage(nextPage);
      setVisibleResults(nextVisible);
      setHasMore(nextVisible.length < sorted.length);
      setLoadingMore(false);
      setIsScrolling(false);

      console.log("[스크롤] 데이터 로드 완료:", {
        총개수: sorted.length,
        표시개수: nextVisible.length,
        더보기가능: nextVisible.length < sorted.length,
      });
    }, 300);
  }, [
    loading,
    loadingMore,
    hasMore,
    page,
    allQuestions,
    filters.type,
    sortResults,
  ]);

  const handleBookmarkToggle = useCallback(
    async (id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!loginState || !userId) {
        showToast("로그인이 필요합니다.", "error");
        navigate("/signin");
        return;
      }

      try {
        const item = allQuestions.find((item) => item.id === id);
        if (!item?.interviewId) {
          throw new Error("면접 ID를 찾을 수 없습니다.");
        }

        // 낙관적 UI 업데이트
        setAllQuestions((prev) =>
          prev.map((question) =>
            question.id === id
              ? { ...question, bookmarked: !question.bookmarked }
              : question,
          ),
        );

        const response = await toggleInterviewBookmark(
          item.interviewId,
          userId,
        );

        // 서버 응답으로 실제 상태 업데이트
        setAllQuestions((prev) =>
          prev.map((question) =>
            question.id === id
              ? { ...question, bookmarked: response.bookmarked }
              : question,
          ),
        );

        // 성공 메시지 표시
        showToast(response.message, "success");
      } catch (error) {
        console.error("[북마크 토글 실패]", error);

        // 오류 발생 시 UI 롤백
        setAllQuestions((prev) =>
          prev.map((question) =>
            question.id === id
              ? { ...question, bookmarked: !question.bookmarked }
              : question,
          ),
        );

        showToast(
          error.response?.data?.message ||
            "북마크 처리 중 오류가 발생했습니다.",
          "error",
        );
      }
    },
    [allQuestions, userId, loginState, navigate, showToast],
  );

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (id) => {
      if (isDeleteMode) return; // 삭제 모드에서는 카드 클릭 비활성화
      const item = visibleResults.find((item) => item.id === id);
      if (item?.interviewId) {
        navigate(`/interview-result/${item.interviewId}`);
      }
    },
    [navigate, visibleResults, isDeleteMode],
  );

  // 항목 선택 토글 핸들러
  const handleSelectToggle = useCallback((id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // 삭제 확인 모달 표시
  const handleDeleteConfirm = useCallback(() => {
    const selectedCount = Object.values(selected).filter(Boolean).length;

    if (selectedCount === 0) {
      showToast("삭제할 항목을 선택해주세요.", "warning");
      return;
    }

    setConfirmMessage(
      `선택한 ${selectedCount}개의 면접 결과를 삭제하시겠습니까?`,
    );
    setConfirmModalOpen(true);
  }, [selected, showToast]);

  // 선택한 항목 삭제 처리
  const deleteSelectedItems = useCallback(async () => {
    try {
      const selectedIds = Object.keys(selected).filter((id) => selected[id]);
      if (selectedIds.length === 0) {
        showToast("선택된 항목이 없습니다.", "warning");
        return;
      }

      setConfirmModalOpen(false);
      setLoading(true);

      // 원본 면접 ID 추출
      const interviewIds = selectedIds
        .map((id) => {
          const item = allQuestions.find((q) => q.id === id);
          return item?.originalId || item?.interviewId;
        })
        .filter(Boolean);

      console.log("[삭제] 요청 데이터:", { interviewIds, userId });

      // API 호출
      const response = await batchDeleteInterviews(interviewIds, userId);

      if (response.success) {
        // UI 업데이트
        setAllQuestions((prev) =>
          prev.filter((item) => !selectedIds.includes(item.id)),
        );
        setSelected({});
        setIsDeleteMode(false);
        showToast(
          response.message || "선택한 면접이 삭제되었습니다.",
          "success",
        );
      } else {
        throw new Error(response.message || "삭제 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("[삭제 실패]", error);
      showToast(
        error.response?.data?.message || "삭제 처리 중 오류가 발생했습니다.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [selected, allQuestions, userId, showToast]);

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
      console.log("[초기화] 데이터 로드 시작");
      fetchAllQuestions().then(() => {
        setInitialDataLoaded(true);
        console.log("[초기화] 데이터 로드 완료");
      });
    }
  }, [initialDataLoaded, fetchAllQuestions, loginState, userId]);

  useEffect(() => {
    updateVisibleResults();
  }, [allQuestions, filters.type, page, updateVisibleResults]);

  const handleScroll = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 스크롤이 하단에서 100px 이내일 때 추가 데이터 로드
    if (documentHeight - (scrollPosition + windowHeight) < 100) {
      console.log("[스크롤] 추가 데이터 로드 시작");
      setIsScrolling(true);
      loadMoreResults();
    }
  }, [loading, loadingMore, hasMore, loadMoreResults]);

  useEffect(() => {
    // 스크롤 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // 삭제 모드가 켜지면 선택 상태 초기화
  useEffect(() => {
    if (!isDeleteMode) {
      setSelected({});
    }
  }, [isDeleteMode]);

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
          onDeleteConfirm={handleDeleteConfirm}
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
            <div className="my-4 flex w-full justify-center" ref={loadingRef}>
              <LoadingIndicator />
            </div>
          )}

          {!hasMore &&
            !loading &&
            !loadingMore &&
            visibleResults.length > 0 && (
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
          btnHandler={deleteSelectedItems}
        />
      )}
    </div>
  );
};

export default QuestionList;
