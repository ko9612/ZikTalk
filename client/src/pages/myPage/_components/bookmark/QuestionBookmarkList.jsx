import React, { useState, useEffect } from "react";
import { faqData } from "@/data/faqData";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useInfiniteScroll } from "../common/useInfiniteScroll";
import { useBookmark } from "../common/useBookmark";
import { useFilter } from "../common/useFilter";
import { 
  PAGE_SIZE, 
  TEXT_COLORS, 
  convertToBookmarkData, 
  filterBookmarks,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
  ScrollPrompt
} from "./settings";

const QuestionBookmarkList = ({ testEmpty }) => {
  // 상태 관리
  const [openIds, setOpenIds] = useState([]);
  const [page, setPage] = useState(0);
  const [visibleResults, setVisibleResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 커스텀 훅
  const { starredItems, toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형"
  });

  // 필터링 함수
  const getFilteredBookmarksByFilters = (jobFilter, typeFilter) => {
    return filterBookmarks(faqData, jobFilter, typeFilter, starredItems, testEmpty);
  };

  const getFilteredBookmarks = () => {
    return getFilteredBookmarksByFilters(filters.job, filters.questionType);
  };

  // 더 많은 결과 로드
  const loadMoreResults = () => {
    setLoading(true);
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
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((openId) => openId !== id);
      } else {
        return [...prev, id];
      }
    });
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
  }, []);

  return (
    <div className="mx-auto w-full pt-6">
      <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
        질문 북마크
      </h2>
      
      <FilterComponent 
        filters={filters} 
        onJobFilterChange={handleJobFilterChange} 
        onTypeFilterChange={handleTypeFilterChange} 
      />
      
      {visibleResults.length === 0 ? (
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
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList; 