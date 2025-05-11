import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteScroll } from "@/components/common/useInfiniteScroll";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import EmptyQuestionList from "./EmptyQuestionList";
<<<<<<< Updated upstream
import { 
  // 상수
=======
import {
>>>>>>> Stashed changes
  PAGE_SIZE,
  Header,
  FilterBar,
  ResultGrid,
  LoadingIndicator,
  ScrollPrompt,
  prepareInitialData,
<<<<<<< Updated upstream
  // 훅
  useQuestionListState
=======
  useQuestionListState,
>>>>>>> Stashed changes
} from "./settings";

const QuestionList = (props) => {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  
  // 북마크 및 필터 상태 관리
=======

>>>>>>> Stashed changes
  const { starredItems, toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    type: "최신순",
    rating: 0
  });

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

<<<<<<< Updated upstream
  // 비구조화 할당으로 상태 값 추출
  const { 
    page, 
    visibleResults, 
    hasMore, 
    loading, 
    selected, 
    isDeleteMode 
  } = state;
=======
  const { page, visibleResults, hasMore, loading, selected, isDeleteMode } =
    state;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
  const handleFilterChange = useCallback(
    (type) => {
      updateFilter("type", type);
      setUserScrolled(false);

      const sortedData = getSortedResultsByType(type, starredItems);
      resetPagination(sortedData);
    },
    [
      updateFilter,
      getSortedResultsByType,
      resetPagination,
      setUserScrolled,
      starredItems,
    ],
  );
>>>>>>> Stashed changes

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

  useEffect(() => {
    const sortedData = getSortedResultsByType(filters.type, starredItems);
    resetPagination(sortedData);
  }, [filters.type, starredItems, getSortedResultsByType, resetPagination]);

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
<<<<<<< Updated upstream
      <Header />
      
      <FilterBar 
        filterValue={filters.type}
        onFilterChange={handleFilterChange}
        isDeleteMode={isDeleteMode}
        onDeleteToggle={handleDeleteItems}
      />
      
=======
      <Header showDescription={visibleResults.length > 0} />

      {visibleResults.length > 0 && (
        <FilterBar
          filterValue={filters.type}
          onFilterChange={handleFilterChange}
          isDeleteMode={isDeleteMode}
          onDeleteToggle={handleDeleteItems}
        />
      )}

>>>>>>> Stashed changes
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