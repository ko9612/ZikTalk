import React, { useState, useEffect, useMemo, useCallback } from "react";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import axios from "axios";
import { API_URL } from "@/api/myPageApi";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  convertToBookmarkData,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";

const QuestionBookmarkList = ({ testEmpty }) => {
  const [openIds, setOpenIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const { toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  const fetchBookmarkedQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (testEmpty) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/mypage/bookmarks`);
      if (!response.data || !response.data.questions) {
        setError("서버 응답 형식이 올바르지 않습니다.");
        setQuestions([]);
        setLoading(false);
        return;
      }

      const formattedQuestions = Array.isArray(response.data.questions)
        ? response.data.questions
            .map((q) => ({
              id: q.id, // 실제 ID는 유지
              career: q.interview?.role || "미분류",
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked || false,
              interviewId: q.interviewId,
            }))
            .filter((q) => q.bookmarked)
        : [];

      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (err) {
      setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      setQuestions([]);
      setLoading(false);
    }
  }, [testEmpty]);

  const handleBookmarkToggle = useCallback(
    async (id) => {
      try {
        setQuestions((prev) => {
          const index = prev.findIndex((q) => q.id === id);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            bookmarked: !updated[index].bookmarked,
          };
          return updated;
        });
        toggleBookmark(id);

        try {
          await axios.patch(`${API_URL}/questions/${id}/bookmark`);
        } catch (err) {
          setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
            ),
          );
          toggleBookmark(id);
        }
      } catch (err) {
        setError(`북마크 토글 오류: ${err.message || "알 수 없는 오류"}`);
      }
    },
    [toggleBookmark],
  );

  const filteredData = useMemo(() => {
    // 정렬 순서: 북마크된 항목이 최상단, 그 다음 id로 정렬
    const sortedQuestions = [...questions].sort((a, b) => {
      // 북마크 상태가 다르면 북마크된 항목이 먼저 오도록
      if (a.bookmarked !== b.bookmarked) {
        return a.bookmarked ? -1 : 1;
      }
      // 북마크 상태가 같으면 id 오름차순 정렬
      return a.id - b.id;
    });

    return sortedQuestions.filter((q) => {
      const jobMatch = filters.job === "직군·직무" || q.career === filters.job;
      const typeMatch =
        filters.questionType === "질문유형" || q.type === filters.questionType;
      return jobMatch && typeMatch;
    });
  }, [questions, filters.job, filters.questionType]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  }, [filteredData.length]);

  const loadPageData = useCallback(
    (page) => {
      setLoading(true);
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      // 현재 페이지에 표시될 아이템
      const pageItems = filteredData.slice(startIndex, endIndex);

      // 페이지 내에서 순차적인 인덱스를 생성하여 표시 (1부터 시작)
      const itemsWithDisplayIndex = pageItems.map((item, index) => {
        const displayIndex = startIndex + index + 1; // 페이지 시작 인덱스 + 현재 인덱스 + 1 (1부터 시작하도록)
        const result = { ...item, displayIndex };
        console.log("변환된 항목:", result);
        return result;
      });

      setVisibleResults(itemsWithDisplayIndex);
      setLoading(false);
    },
    [filteredData],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      loadPageData(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [loadPageData],
  );

  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
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

  useEffect(() => {
    fetchBookmarkedQuestions();
  }, [fetchBookmarkedQuestions]);

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

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
          <button
            className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
            onClick={() => {
              axios
                .get("http://localhost:5000/api/mypage/bookmarks")
                .then((res) => console.log("테스트 성공:", res.data))
                .catch((err) => console.error("테스트 실패:", err));
            }}
          >
            API 테스트
          </button>
        </div>
      )}

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
              <div className="min-h-[350px] p-2">
                {visibleResults.map((item) => {
                  console.log(
                    "렌더링 항목:",
                    item.id,
                    "displayId:",
                    item.displayIndex,
                  );
                  return (
                    <div key={item.id}>
                      <FaqItem
                        id={item.id}
                        displayId={item.displayIndex}
                        career={item.career}
                        type={item.type}
                        question={item.question}
                        answer={item.answer}
                        recommendation={item.recommendation}
                        isExpanded={openIds.includes(item.id)}
                        onToggle={() => toggleOpen(item.id)}
                        isStarred={item.bookmarked}
                        onStarToggle={() => handleBookmarkToggle(item.id)}
                        textColors={TEXT_COLORS}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="h-20">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
