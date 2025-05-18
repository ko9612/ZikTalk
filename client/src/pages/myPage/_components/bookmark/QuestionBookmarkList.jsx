import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";

// 로그 헬퍼 함수 추가
const logDebug = (component, action, data) => {
  console.log(`📌 [${component}] ${action}:`, data);
};

const QuestionBookmarkList = ({ testEmpty }) => {
  console.log("🔄 QuestionBookmarkList 컴포넌트 렌더링");
  const navigate = useNavigate();
  const { isAuthenticated, userId, fetchBookmarkedQuestions, authFetch } = useAuth();
  logDebug("BookmarkList", "인증 상태", { isAuthenticated, userId });
  
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

  const fetchBookmarksData = useCallback(async () => {
    logDebug("BookmarkList", "북마크 데이터 로드 시도", { isAuthenticated, userId, testEmpty });
    
    if (!isAuthenticated || !userId) {
      logDebug("BookmarkList", "북마크 데이터 로드 취소", "인증되지 않음");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      if (testEmpty) {
        logDebug("BookmarkList", "테스트 모드", "빈 결과 반환");
        setQuestions([]);
        setLoading(false);
        return;
      }

      logDebug("BookmarkList", "북마크 API 호출 시작", {});
      // useAuth 훅의 fetchBookmarkedQuestions 메서드 사용
      const response = await fetchBookmarkedQuestions();
      logDebug("BookmarkList", "북마크 API 호출 성공", {
        response: response ? "데이터 있음" : "데이터 없음",
        questions: response?.questions ? `${response.questions.length}개` : "없음"
      });
      
      if (!response || !response.questions) {
        logDebug("BookmarkList", "응답 형식 오류", { 
          response: response ? "존재함" : "없음",
          hasQuestions: response?.questions ? true : false
        });
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

      logDebug("BookmarkList", "데이터 변환 완료", { 
        원본개수: response.questions.length,
        필터링후: formattedQuestions.length 
      });
      
      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (err) {
      logDebug("BookmarkList", "API 호출 실패", { 
        message: err.message,
        status: err.response?.status,
        details: err.response?.data 
      });
      setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      setQuestions([]);
      setLoading(false);
    }
  }, [testEmpty, isAuthenticated, userId, fetchBookmarkedQuestions]);

  const handleBookmarkToggle = useCallback(
    async (id) => {
      logDebug("BookmarkList", "북마크 토글 시도", { questionId: id });
      
      if (!isAuthenticated || !userId) {
        logDebug("BookmarkList", "북마크 토글 취소", "인증되지 않음");
        navigate('/signin');
        return;
      }
      
      try {
        // UI 즉시 업데이트 (낙관적 업데이트)
        setQuestions((prev) => {
          const index = prev.findIndex((q) => q.id === id);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            bookmarked: !updated[index].bookmarked,
          };
          logDebug("BookmarkList", "북마크 UI 업데이트", { 
            questionId: id, 
            북마크상태: !updated[index].bookmarked 
          });
          return updated;
        });
        toggleBookmark(id);

        try {
          // 인증된 API 호출로 북마크 토글
          logDebug("BookmarkList", "북마크 API 호출", { questionId: id, userId });
          await authFetch(`/questions/${id}/bookmark`, {
            method: 'PATCH',
            data: { userId }
          });
          logDebug("BookmarkList", "북마크 API 성공", { questionId: id });
        } catch (err) {
          // 실패 시 롤백
          logDebug("BookmarkList", "북마크 API 실패", { 
            questionId: id, 
            message: err.message,
            status: err.response?.status
          });
          setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
            ),
          );
          toggleBookmark(id);
        }
      } catch (err) {
        logDebug("BookmarkList", "북마크 처리 오류", { questionId: id, error: err.message });
        setError(`북마크 토글 오류: ${err.message || "알 수 없는 오류"}`);
      }
    },
    [toggleBookmark, isAuthenticated, userId, navigate, authFetch],
  );

  const filteredData = useMemo(() => {
    const sortedQuestions = [...questions].sort((a, b) => {
      if (a.bookmarked !== b.bookmarked) {
        return a.bookmarked ? -1 : 1;
      }
      return a.id - b.id;
    });

    const filtered = sortedQuestions.filter((q) => {
      if (q.userId && q.userId !== userId) return false;
      
      const jobMatch = filters.job === "직군·직무" || q.career === filters.job;
      const typeMatch =
        filters.questionType === "질문유형" || q.type === filters.questionType;
      return jobMatch && typeMatch;
    });
    
    logDebug("BookmarkList", "데이터 필터링", { 
      전체질문수: questions.length, 
      필터링후: filtered.length,
      직군필터: filters.job,
      유형필터: filters.questionType
    });
    
    return filtered;
  }, [questions, filters.job, filters.questionType, userId]);

  const totalPages = useMemo(() => {
    const pages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    logDebug("BookmarkList", "페이지 계산", { 결과수: filteredData.length, 총페이지: pages });
    return pages;
  }, [filteredData.length]);

  const loadPageData = useCallback(
    (page) => {
      logDebug("BookmarkList", "페이지 데이터 로드", { page, isAuthenticated, userId });
      
      if (!isAuthenticated || !userId) {
        logDebug("BookmarkList", "페이지 로드 취소", "인증되지 않음");
        return;
      }
      
      setLoading(true);
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      const pageItems = filteredData.slice(startIndex, endIndex);
      logDebug("BookmarkList", "페이지 아이템 로드됨", { 시작: startIndex, 끝: endIndex, 개수: pageItems.length });

      const itemsWithDisplayIndex = pageItems.map((item, index) => {
        const displayIndex = startIndex + index + 1;
        const result = { ...item, displayIndex };
        return result;
      });

      setVisibleResults(itemsWithDisplayIndex);
      setLoading(false);
    },
    [filteredData, isAuthenticated, userId],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (!isAuthenticated || !userId) {
        navigate('/signin');
        return;
      }
      
      setCurrentPage(newPage);
      loadPageData(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [loadPageData, isAuthenticated, userId, navigate],
  );

  const toggleOpen = useCallback((id) => {
    if (!isAuthenticated || !userId) {
      navigate('/signin');
      return;
    }
    
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  }, [isAuthenticated, userId, navigate]);

  const handleJobFilterChange = useCallback(
    (value) => {
      if (!isAuthenticated || !userId) {
        navigate('/signin');
        return;
      }
      
      updateFilter("job", value);
      setCurrentPage(1);
    },
    [updateFilter, isAuthenticated, userId, navigate],
  );

  const handleTypeFilterChange = useCallback(
    (value) => {
      if (!isAuthenticated || !userId) {
        navigate('/signin');
        return;
      }
      
      updateFilter("questionType", value);
      setCurrentPage(1);
    },
    [updateFilter, isAuthenticated, userId, navigate],
  );

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchBookmarksData();
    }
  }, [fetchBookmarksData, isAuthenticated, userId]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadPageData(currentPage);
    }
  }, [currentPage, filteredData, loadPageData, isAuthenticated, userId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-8">이 페이지를 이용하려면 로그인이 필요합니다.</p>
          <button
            onClick={() => navigate('/signin')}
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

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
              fetchBookmarkedQuestions()
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
