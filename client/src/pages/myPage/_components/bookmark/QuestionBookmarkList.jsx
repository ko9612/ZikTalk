import React, { useState, useEffect, useMemo, useCallback } from "react";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import { 
  fetchBookmarks, 
  toggleQuestionBookmark, 
  getHiddenQuestions, 
  hideQuestion 
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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});

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
      
      // 숨겨진 질문 목록 가져오기
      const hiddenQuestions = getHiddenQuestions();
      
      // 숨겨진 질문 필터링
      const filteredQuestions = Array.isArray(fetchedQuestions)
        ? fetchedQuestions.filter(q => !hiddenQuestions.includes(q.id))
        : [];
      
      const formattedQuestions = filteredQuestions.map((q, index) => ({
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

      setQuestions(formattedQuestions);
      // 필터링된 항목 수를 기준으로 total 재계산 (숨겨진 항목은 제외)
      const adjustedTotal = Math.max(0, total - (fetchedQuestions.length - filteredQuestions.length));
      setTotalItems(adjustedTotal || formattedQuestions.length);
      setVisibleResults(formattedQuestions);
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

  // 삭제 모드 토글
  const toggleDeleteMode = useCallback(() => {
    setIsDeleteMode(prev => !prev);
    setSelectedItems({}); // 선택 항목 초기화
  }, []);

  // 항목 선택/해제
  const toggleSelectItem = useCallback((id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // 선택된 항목 삭제 (숨김 처리)
  const deleteSelectedItems = useCallback(() => {
    // 선택된 항목 ID 수집
    const itemsToDelete = Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (itemsToDelete.length === 0) return;
    
    // 각 항목 숨김 처리
    itemsToDelete.forEach(id => {
      const item = questions.find(q => q.id.toString() === id);
      if (item) {
        hideQuestion(item.originalId);
      }
    });
    
    // UI에서 항목 제거
    const updatedQuestions = questions.filter(
      q => !itemsToDelete.includes(q.id.toString())
    );
    
    setQuestions(updatedQuestions);
    setVisibleResults(updatedQuestions);
    setSelectedItems({}); // 선택 항목 초기화
    setIsDeleteMode(false); // 삭제 모드 종료
  }, [questions, selectedItems]);

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

      <div className="mb-4 flex justify-between items-center">
        <FilterComponent
          filters={filters}
          onJobFilterChange={handleJobFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
        />
        
        <div className="flex items-center">
          {isDeleteMode ? (
            <>
              <button 
                onClick={deleteSelectedItems}
                className="mr-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                삭제
              </button>
              <button 
                onClick={toggleDeleteMode}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                취소
              </button>
            </>
          ) : (
            <button 
              onClick={toggleDeleteMode}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              항목 삭제
            </button>
          )}
        </div>
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
                  <div key={item.id} className={`
                    ${isDeleteMode && selectedItems[item.id] ? "bg-red-50" : ""}
                  `}>
                    {isDeleteMode ? (
                      <div className="flex items-center p-2">
                        <input 
                          type="checkbox" 
                          checked={selectedItems[item.id] || false}
                          onChange={() => toggleSelectItem(item.id)}
                          className="mr-3 h-4 w-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.question}</h3>
                          <p className="text-sm text-gray-500">{item.career} | {item.type}</p>
                        </div>
                      </div>
                    ) : (
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
                    )}
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
