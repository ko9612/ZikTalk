import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteScroll } from "../common/useInfiniteScroll";
import { useBookmark } from "../common/useBookmark";
import { useFilter } from "../common/useFilter";
import EmptyQuestionList from "./EmptyQuestionList";
import { 
  // 상수
  PAGE_SIZE,
  // 컴포넌트
  Header,
  FilterBar,
  ResultGrid,
  LoadingIndicator,
  ScrollPrompt,
  // 유틸리티
  prepareInitialData,
  // 훅
  useQuestionListState
} from "./settings";

// 메인 QuestionList 컴포넌트
const QuestionList = (props) => {
  const navigate = useNavigate();
  
  // 북마크 및 필터 상태 관리
  const { starredItems, toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    type: "최신순",
    rating: 0
  });

  // 질문 목록 상태 관리
  const {
    state,
    getSortedResultsByType,
    setLoading,
    toggleSelectItem,
    toggleDeleteMode,
    deleteSelectedItems,
    resetPagination,
    loadMoreItems
  } = useQuestionListState(props);

  // 비구조화 할당으로 상태 값 추출
  const { 
    page, 
    visibleResults, 
    hasMore, 
    loading, 
    selected, 
    isDeleteMode 
  } = state;

  // 무한 스크롤 처리
  const loadMoreResults = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const sortedData = getSortedResultsByType(filters.type, starredItems);
      const nextPage = page + 1;
      loadMoreItems(sortedData, nextPage);
    }, 500);
  }, [page, filters.type, getSortedResultsByType, loadMoreItems, setLoading, starredItems]);

  const { lastElementRef, userScrolled, setUserScrolled, debounceScrollAction } = useInfiniteScroll(
    loadMoreResults,
    hasMore,
    loading,
    setLoading
  );

  // 이벤트 핸들러
  const handleFilterChange = useCallback((type) => {
    updateFilter('type', type);
    setUserScrolled(false);
    
    // 필터 변경 시 페이지네이션 리셋
    const sortedData = getSortedResultsByType(type, starredItems);
    resetPagination(sortedData);
  }, [updateFilter, getSortedResultsByType, resetPagination, setUserScrolled, starredItems]);

  const handleSelectToggle = useCallback((id) => {
    toggleSelectItem(id);
  }, [toggleSelectItem]);

  const handleBookmarkToggle = useCallback((id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleBookmark(id);
    debounceScrollAction();
  }, [toggleBookmark, debounceScrollAction]);

  const handleCardClick = useCallback((id) => {
    navigate(`/interview-result/${id}`);
  }, [navigate]);

  const handleDeleteItems = useCallback(() => {
    if (isDeleteMode) {
      deleteSelectedItems();
      alert("선택된 카드가 삭제되었습니다.");
    } else {
      toggleDeleteMode();
    }
  }, [isDeleteMode, deleteSelectedItems, toggleDeleteMode]);

  // 초기 데이터 로드 및 필터 변경 시 데이터 업데이트
  useEffect(() => {
    const sortedData = getSortedResultsByType(filters.type, starredItems);
    resetPagination(sortedData);
  }, [filters.type, starredItems, getSortedResultsByType, resetPagination]);

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
      <Header />
      
      <FilterBar 
        filterValue={filters.type}
        onFilterChange={handleFilterChange}
        isDeleteMode={isDeleteMode}
        onDeleteToggle={handleDeleteItems}
      />
      
      {visibleResults.length === 0 ? (
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
            starredItems={starredItems}
          />
          
          {loading && <LoadingIndicator />}
          
          {hasMore && !loading && visibleResults.length > 0 && <ScrollPrompt />}
        </>
      )}
    </div>
  );
};

export default QuestionList;