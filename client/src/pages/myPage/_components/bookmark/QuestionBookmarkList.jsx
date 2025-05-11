import React, { useState, useEffect, useMemo, useCallback } from "react";
import { faqData } from "@/data/faqData";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
<<<<<<< Updated upstream
import { useInfiniteScroll } from "../common/useInfiniteScroll";
import { useBookmark } from "../common/useBookmark";
import { useFilter } from "../common/useFilter";
import { 
  PAGE_SIZE, 
  TEXT_COLORS, 
  convertToBookmarkData, 
=======
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  convertToBookmarkData,
>>>>>>> Stashed changes
  filterBookmarks,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
<<<<<<< Updated upstream
  ScrollPrompt
=======
>>>>>>> Stashed changes
} from "./settings";

const QuestionBookmarkList = ({ testEmpty }) => {
  const [openIds, setOpenIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { starredItems, toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형"
  });

<<<<<<< Updated upstream
  // 필터링 함수
  const getFilteredBookmarksByFilters = (jobFilter, typeFilter) => {
    return filterBookmarks(faqData, jobFilter, typeFilter, starredItems, testEmpty);
  };
=======
  const filteredData = useMemo(() => {
    return filterBookmarks(
      faqData,
      filters.job,
      filters.questionType,
      starredItems,
      testEmpty
    );
  }, [filters.job, filters.questionType, starredItems, testEmpty]);
>>>>>>> Stashed changes

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  }, [filteredData.length]);

  const loadPageData = useCallback((page) => {
    setLoading(true);
<<<<<<< Updated upstream
    setTimeout(() => {
      const filteredData = getFilteredBookmarks();
      const nextPage = page + 1;
      const newResults = filteredData.slice(0, (nextPage + 1) * PAGE_SIZE);
      
      setVisibleResults(newResults);
      setPage(nextPage);
      setHasMore(newResults.length < filteredData.length);
      setLoading(false);
    }, 500);
  };

  // 무한 스크롤 훅
  const { lastElementRef, userScrolled, setUserScrolled, debounceScrollAction } = useInfiniteScroll(
    loadMoreResults,
    hasMore,
    loading
  );

  // 아이템 토글 함수
  const toggleOpen = (id) => {
=======
    
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    setVisibleResults(pageData);
    setLoading(false);
  }, [filteredData]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    loadPageData(newPage);
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [loadPageData]);

  const toggleOpen = useCallback((id) => {
>>>>>>> Stashed changes
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((openId) => openId !== id);
      } else {
        return [...prev, id];
      }
    });
<<<<<<< Updated upstream
    debounceScrollAction();
  };

  // 필터 변경 핸들러
  const handleJobFilterChange = (value) => {
    updateFilter('job', value);
    resetAndFilterResults(value, filters.questionType);
  };

  const handleTypeFilterChange = (value) => {
    updateFilter('questionType', value);
    resetAndFilterResults(filters.job, value);
  };

  // 필터 결과 리셋 및 업데이트
  const resetAndFilterResults = (jobFilter, typeFilter) => {
    const filteredData = getFilteredBookmarksByFilters(jobFilter, typeFilter);
    setVisibleResults(filteredData.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(filteredData.length > PAGE_SIZE);
    setUserScrolled(false);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initialData = getFilteredBookmarks();
    setVisibleResults(initialData.slice(0, PAGE_SIZE));
    setHasMore(initialData.length > PAGE_SIZE);
=======
>>>>>>> Stashed changes
  }, []);

  const handleJobFilterChange = useCallback((value) => {
    updateFilter("job", value);
    setCurrentPage(1);
  }, [updateFilter]);

  const handleTypeFilterChange = useCallback((value) => {
    updateFilter("questionType", value);
    setCurrentPage(1);
  }, [updateFilter]);

  const handleBookmarkToggle = useCallback((id) => {
    toggleBookmark(id);
  }, [toggleBookmark]);

  useEffect(() => {
    loadPageData(currentPage);
  }, [currentPage, filteredData, loadPageData]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="mx-auto w-full pt-6">
      <h2 className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}>
        질문 북마크
      </h2>
      
      <FilterComponent 
        filters={filters} 
        onJobFilterChange={handleJobFilterChange} 
        onTypeFilterChange={handleTypeFilterChange} 
      />
<<<<<<< Updated upstream
      
      {visibleResults.length === 0 ? (
        <EmptyBookmarkList 
=======

      {filteredData.length === 0 ? (
        <EmptyBookmarkList
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          
          <div className="h-full overflow-y-hidden rounded-lg mb-4 pr-2">
            {visibleResults.map((item, idx) => (
              <div
                key={item.id}
                ref={idx === visibleResults.length - 1 ? lastElementRef : null}
              >
                <FaqItem
                  id={item.id}
                  career={item.job}
                  type={item.type}
                  question={item.question}
                  answer={item.answer}
                  recommendation={item.recommendation}
                  isExpanded={openIds.includes(item.id)}
                  onToggle={() => toggleOpen(item.id)}
                  isStarred={starredItems.includes(String(item.id))}
                  onStarToggle={() => {
                    toggleBookmark(item.id);
                    debounceScrollAction();
                  }}
                  textColors={TEXT_COLORS}
                />
              </div>
            ))}
            
            {loading && <LoadingIndicator />}
            
            {hasMore && !loading && visibleResults.length > 0 && <ScrollPrompt />}
=======

          <div className="mb-4 h-full overflow-y-hidden rounded-lg">
            {loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <div className="min-h-[350px]">
                  {visibleResults.map((item) => (
                    <div key={item.id}>
                      <FaqItem
                        id={item.id}
                        career={item.job}
                        type={item.type}
                        question={item.question}
                        answer={item.answer}
                        recommendation={item.recommendation}
                        isExpanded={openIds.includes(item.id)}
                        onToggle={() => toggleOpen(item.id)}
                        isStarred={starredItems.includes(String(item.id))}
                        onStarToggle={() => handleBookmarkToggle(item.id)}
                        textColors={TEXT_COLORS}
                      />
                    </div>
                  ))}
                </div>

                <div className="h-20">
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </>
            )}
>>>>>>> Stashed changes
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList; 