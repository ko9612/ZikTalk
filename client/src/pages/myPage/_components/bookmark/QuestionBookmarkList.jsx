import React, { useState, useEffect, useMemo, useCallback } from "react";
import { faqData } from "@/data/faqData";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  convertToBookmarkData,
  filterBookmarks,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";

const QuestionBookmarkList = ({ testEmpty }) => {
  const [openIds, setOpenIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { starredItems, toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  const filteredData = useMemo(() => {
    return filterBookmarks(
      faqData,
      filters.job,
      filters.questionType,
      starredItems,
      testEmpty,
    );
  }, [filters.job, filters.questionType, starredItems, testEmpty]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  }, [filteredData.length]);

  const loadPageData = useCallback(
    (page) => {
      setLoading(true);

      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pageData = filteredData.slice(startIndex, endIndex);

      setVisibleResults(pageData);
      setLoading(false);
    },
    [filteredData],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      loadPageData(newPage);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    [loadPageData],
  );

  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((openId) => openId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleJobFilterChange = useCallback(
    (value) => {
      updateFilter("job", value);
      setCurrentPage(1);
    },
    [updateFilter],
  );

  const handleTypeFilterChange = useCallback(
    (value) => {
      updateFilter("questionType", value);
      setCurrentPage(1);
    },
    [updateFilter],
  );

  const handleBookmarkToggle = useCallback(
    (id) => {
      toggleBookmark(id);
    },
    [toggleBookmark],
  );

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
      <h2
        className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}
      >
        질문 북마크
      </h2>

      <FilterComponent
        filters={filters}
        onJobFilterChange={handleJobFilterChange}
        onTypeFilterChange={handleTypeFilterChange}
      />

      {filteredData.length === 0 ? (
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

          <div className="mb-4 h-full overflow-y-hidden rounded-lg">
            {loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <div className="min-h-[350px] p-2">
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
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
