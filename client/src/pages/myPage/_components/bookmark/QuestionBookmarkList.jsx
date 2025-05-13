import React, { useState, useEffect, useMemo, useCallback } from "react";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter, JOB_OPTIONS, TYPE_OPTIONS } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import { 
  fetchBookmarks, 
  toggleQuestionBookmark
} from "@/api/myPageApi";
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
  const [totalItems, setTotalItems] = useState(0);

  const { toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  // 현재 페이지 데이터만 가져오는 함수
  const fetchPageData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      if (testEmpty) {
        setQuestions([]);
        setTotalItems(0);
        setLoading(false);
        return;
      }

      // 페이지네이션 처리를 위해 페이지와 필터 정보를 쿼리 파라미터로 전달
      const data = await fetchBookmarks(page, PAGE_SIZE, {
        job: filters.job !== "직군·직무" ? filters.job : undefined, 
        questionType: filters.questionType !== "질문유형" ? filters.questionType : undefined
      });

      if (!data) {
        setError("서버 응답 형식이 올바르지 않습니다.");
        setQuestions([]);
        setLoading(false);
        return;
      }

      const { questions: fetchedQuestions, total } = data;
      
      if (!Array.isArray(fetchedQuestions)) {
        setError("서버에서 배열 형태의 질문을 반환하지 않았습니다.");
        setQuestions([]);
        setLoading(false);
        return;
      }

      // 응답 데이터 변환
      const formattedQuestions = fetchedQuestions.map((q, index) => ({
        id: ((page - 1) * PAGE_SIZE) + index + 1, // 페이지에 따라 ID 계산
        originalId: q.id,
        career: q.interview?.role || "미분류",
        type: q.type === "PERSONALITY" ? "인성" : "직무",
        question: q.content,
        answer: q.myAnswer,
        recommendation: q.recommended,
        bookmarked: q.bookmarked || false,
        interviewId: q.interviewId,
      }));

      // 정렬 로직 적용 (필터링 대신 우선순위 정렬)
      let sortedResults = [...formattedQuestions];
      
      // 직군·직무 필터에 따른 정렬
      if (filters.job !== "직군·직무") {
        const jobValue = filters.job.toLowerCase();
        
        // 정확한 일치, 부분 일치, 일치하지 않음 순으로 정렬
        sortedResults.sort((a, b) => {
          const aCareer = (a.career || "").toLowerCase();
          const bCareer = (b.career || "").toLowerCase();
          
          // 정확히 일치하는 경우
          const aExactMatch = aCareer === jobValue;
          const bExactMatch = bCareer === jobValue;
          
          // 부분 일치하는 경우
          const aPartialMatch = aCareer.includes(jobValue);
          const bPartialMatch = bCareer.includes(jobValue);
          
          // 정확한 일치가 가장 우선
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          // 그 다음은 부분 일치
          if (aPartialMatch && !bPartialMatch) return -1;
          if (!aPartialMatch && bPartialMatch) return 1;
          
          return 0;
        });
      }
      
      // 질문 유형에 따른 정렬
      if (filters.questionType !== "질문유형") {
        sortedResults.sort((a, b) => {
          // 정확한 일치가 우선
          if (a.type === filters.questionType && b.type !== filters.questionType) return -1;
          if (a.type !== filters.questionType && b.type === filters.questionType) return 1;
          return 0;
        });
      }

      // 상태 업데이트
      setQuestions(sortedResults);
      setTotalItems(total || sortedResults.length);
      setVisibleResults(sortedResults);
      setLoading(false);
    } catch (err) {
      setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      setQuestions([]);
      setLoading(false);
    }
  }, [testEmpty, filters.job, filters.questionType]);

  const handleBookmarkToggle = useCallback(
    async (clientId) => {
      try {
        const targetQuestion = questions.find((q) => q.id === clientId);
        if (!targetQuestion) return;

        const realId = targetQuestion.originalId;
        const newBookmarkState = !targetQuestion.bookmarked;

        // UI 상태 업데이트 (북마크 토글)
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === clientId ? { ...q, bookmarked: newBookmarkState } : q
          )
        );
        
        setVisibleResults((prev) =>
          prev.map((q) =>
            q.id === clientId ? { ...q, bookmarked: newBookmarkState } : q
          )
        );

        // 서버에 북마크 토글 요청
        try {
          await toggleQuestionBookmark(realId, newBookmarkState);
          // 성공적으로 북마크 토글되면 클라이언트 상태 관리 함수 호출
          toggleBookmark(realId);
        } catch (err) {
          // 실패 시 원래 상태로 복원
          setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === clientId ? { ...q, bookmarked: !newBookmarkState } : q
            )
          );
          setVisibleResults((prev) =>
            prev.map((q) =>
              q.id === clientId ? { ...q, bookmarked: !newBookmarkState } : q
            )
          );
        }
      } catch (err) {
        setError(`북마크 토글 오류: ${err.message || "알 수 없는 오류"}`);
      }
    },
    [questions, toggleBookmark],
  );

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  }, [totalItems]);

  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      fetchPageData(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [fetchPageData],
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
      setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
    },
    [updateFilter],
  );

  const handleTypeFilterChange = useCallback(
    (value) => {
      updateFilter("questionType", value);
      setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
    },
    [updateFilter],
  );

  // 필터 변경 시 데이터 다시 불러오기
  useEffect(() => {
    fetchPageData(1);
  }, [fetchPageData, filters.job, filters.questionType]);

  // 컴포넌트 마운트 시 첫 페이지 데이터 불러오기
  useEffect(() => {
    fetchPageData(currentPage);
  }, [currentPage, fetchPageData]);

  return (
    <div className="mx-auto w-full pt-6">
      <h2
        className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}
      >
        질문 목록
      </h2>

      <div className="mb-4">
        <FilterComponent
          filters={filters}
          onJobFilterChange={handleJobFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
        />
      </div>

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
        </div>
      )}

      {questions.length === 0 && !loading ? (
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
