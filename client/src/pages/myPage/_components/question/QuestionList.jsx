import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteScroll } from "@/components/common/useInfiniteScroll";
import { useFilter } from "@/components/common/useFilter";
import EmptyQuestionList from "./EmptyQuestionList";
import {
  PAGE_SIZE,
  Header,
  FilterBar,
  ResultGrid,
  LoadingIndicator,
  ScrollPrompt,
  useQuestionListState,
} from "./settings";

const QuestionList = () => {
  const navigate = useNavigate();
  const { filters, updateFilter } = useFilter({
    type: "최신순",
    rating: 0,
  });

  // 데이터 로딩 상태 추적
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const {
    state,
    fetchQuestions,
    toggleQuestionBookmark,
    setLoading,
    toggleSelectItem,
    toggleDeleteMode,
    markAsDeleted,
  } = useQuestionListState();

  const { page, visibleResults, hasMore, loading, selected, isDeleteMode, error } = state;

  // 추가 데이터 로드 함수
  const loadMoreResults = useCallback(() => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // 현재 필터가 초기값이 아니라면 초기화
    if (filters.type !== "최신순") {
      updateFilter("type", "최신순");
      // 필터 초기화 후 최신순으로 첫 페이지부터 다시 로드
      fetchQuestions(0, "최신순");
      // 스크롤 위치를 상단으로 이동
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    // 필터가 이미 최신순이면 다음 페이지 데이터 로드
    fetchQuestions(page + 1, filters.type);
  }, [page, filters.type, fetchQuestions, setLoading, loading, hasMore, updateFilter]);

  // 무한 스크롤 훅 사용
  const {
    lastElementRef,
    userScrolled,
    setUserScrolled,
    debounceScrollAction,
  } = useInfiniteScroll(loadMoreResults, hasMore, loading, setLoading);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (type) => {
      if (type === filters.type) return;
      
      updateFilter("type", type);
      setUserScrolled(false);
      // 필터 변경 시 첫 페이지부터 다시 로드
      fetchQuestions(0, type);
    },
    [updateFilter, fetchQuestions, filters.type],
  );

  // 항목 선택 토글
  const handleSelectToggle = useCallback(
    (id) => {
      toggleSelectItem(id);
    },
    [toggleSelectItem],
  );

  // 북마크 토글
  const handleBookmarkToggle = useCallback(
    (id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // API를 통해 서버 상태만 업데이트
      toggleQuestionBookmark(id)
        .catch((err) => {
          // 실패 시 에러 처리
          console.error("북마크 토글 실패:", err);
        });
    },
    [toggleQuestionBookmark],
  );

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (id) => {
      // 원본 ID가 있는 항목 찾기
      const item = visibleResults.find(item => item.id === id);
      
      if (item && item.interviewId) {
        navigate(`/interview-result/${item.interviewId}`);
      } else {
        console.error("인터뷰 ID를 찾을 수 없습니다:", id);
      }
    },
    [navigate, visibleResults],
  );

  // 항목 삭제 핸들러
  const handleDeleteItems = useCallback(() => {
    if (isDeleteMode) {
      markAsDeleted(selected);
      alert("선택된 카드가 삭제되었습니다.");
    } else {
      toggleDeleteMode();
    }
  }, [isDeleteMode, markAsDeleted, selected, toggleDeleteMode]);

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    if (!initialDataLoaded) {
      fetchQuestions(0, filters.type);
      setInitialDataLoaded(true);
    }
  }, [initialDataLoaded, fetchQuestions, filters.type]);

  // 삭제 모드에서 ESC 키 처리
  useEffect(() => {
    if (!isDeleteMode) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        toggleDeleteMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteMode, toggleDeleteMode]);

  return (
    <div className="mx-auto w-full max-w-5xl px-2 pt-6 sm:px-4">
      <Header showDescription={visibleResults.length > 0} />

      {visibleResults.length > 0 && (
        <FilterBar
          filterValue={filters.type}
          onFilterChange={handleFilterChange}
          isDeleteMode={isDeleteMode}
          onDeleteToggle={handleDeleteItems}
        />
      )}

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
        </div>
      )}

      {visibleResults.length === 0 && !loading ? (
        <EmptyQuestionList />
      ) : (
        <>
          <ResultGrid
            visibleResults={visibleResults}
            lastElementRef={lastElementRef}
            isDeleteMode={isDeleteMode}
            selected={selected}
            handleSelectToggle={handleSelectToggle}
            handleBookmarkToggle={handleBookmarkToggle}
            handleCardClick={handleCardClick}
          />

          {loading && <LoadingIndicator />}

          {hasMore && !loading && visibleResults.length > 0 && <ScrollPrompt />}
        </>
      )}
    </div>
  );
};

export default QuestionList;
