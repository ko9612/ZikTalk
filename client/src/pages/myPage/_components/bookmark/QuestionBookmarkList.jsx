import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import { fetchBookmarks, toggleQuestionBookmark } from "@/api/myPageApi";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";

const QuestionBookmarkList = ({ testEmpty }) => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
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

  useEffect(() => {
    const token = cookies.token;
    if (!token || typeof token !== "string") {
      setIsLoggedIn(false);
      setUserId(null);
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      const userIdFromToken = decoded.userId || decoded.sub || decoded.id;
      
      if (!userIdFromToken) {
        setIsLoggedIn(false);
        setUserId(null);
        return;
      }
      
      setIsLoggedIn(true);
      setUserId(userIdFromToken);
    } catch (err) {
      setIsLoggedIn(false);
      setUserId(null);
    }
  }, [cookies.token]);

  const fetchBookmarkedQuestions = useCallback(async () => {
    if (!isLoggedIn || !userId) return;
    
    try {
      setLoading(true);
      setError(null);

      if (testEmpty) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const response = await fetchBookmarks();
      
      if (!response || !response.questions) {
        setError("서버 응답 형식이 올바르지 않습니다.");
        setQuestions([]);
        setLoading(false);
        return;
      }

      const formattedQuestions = Array.isArray(response.questions)
        ? response.questions
            .map((q) => ({
              id: q.id,
              career: q.interview?.role || "미분류",
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked || false,
              interviewId: q.interviewId,
              userId: q.userId
            }))
            .filter((q) => q.bookmarked && q.userId === userId)
        : [];

      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (err) {
      setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      setQuestions([]);
      setLoading(false);
    }
  }, [testEmpty, isLoggedIn, userId]);

  const handleBookmarkToggle = useCallback(
    async (id) => {
      if (!isLoggedIn || !userId) {
        navigate('/signin');
        return;
      }
      
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
          await toggleQuestionBookmark(id);
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
    [toggleBookmark, isLoggedIn, userId, navigate],
  );

  const filteredData = useMemo(() => {
    const sortedQuestions = [...questions].sort((a, b) => {
      if (a.bookmarked !== b.bookmarked) {
        return a.bookmarked ? -1 : 1;
      }
      return a.id - b.id;
    });

    return sortedQuestions.filter((q) => {
      if (q.userId && q.userId !== userId) return false;
      
      const jobMatch = filters.job === "직군·직무" || q.career === filters.job;
      const typeMatch =
        filters.questionType === "질문유형" || q.type === filters.questionType;
      return jobMatch && typeMatch;
    });
  }, [questions, filters.job, filters.questionType, userId]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  }, [filteredData.length]);

  const loadPageData = useCallback(
    (page) => {
      if (!isLoggedIn || !userId) return;
      
      setLoading(true);
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      const pageItems = filteredData.slice(startIndex, endIndex);

      const itemsWithDisplayIndex = pageItems.map((item, index) => {
        const displayIndex = startIndex + index + 1;
        const result = { ...item, displayIndex };
        return result;
      });

      setVisibleResults(itemsWithDisplayIndex);
      setLoading(false);
    },
    [filteredData, isLoggedIn, userId],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (!isLoggedIn || !userId) {
        navigate('/signin');
        return;
      }
      
      setCurrentPage(newPage);
      loadPageData(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [loadPageData, isLoggedIn, userId, navigate],
  );

  const toggleOpen = useCallback((id) => {
    if (!isLoggedIn || !userId) {
      navigate('/signin');
      return;
    }
    
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  }, [isLoggedIn, userId, navigate]);

  const handleJobFilterChange = useCallback(
    (value) => {
      if (!isLoggedIn || !userId) {
        navigate('/signin');
        return;
      }
      
      updateFilter("job", value);
      setCurrentPage(1);
    },
    [updateFilter, isLoggedIn, userId, navigate],
  );

  const handleTypeFilterChange = useCallback(
    (value) => {
      if (!isLoggedIn || !userId) {
        navigate('/signin');
        return;
      }
      
      updateFilter("questionType", value);
      setCurrentPage(1);
    },
    [updateFilter, isLoggedIn, userId, navigate],
  );

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchBookmarkedQuestions();
    }
  }, [fetchBookmarkedQuestions, isLoggedIn, userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      loadPageData(currentPage);
    }
  }, [currentPage, filteredData, loadPageData, isLoggedIn, userId]);

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
              fetchBookmarks()
                .then((res) => {})
                .catch((err) => {});
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
                {visibleResults.map((item) => (
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
                ))}
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
