import React, { useState, useEffect, useMemo, useCallback } from "react";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import axios from "axios";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  convertToBookmarkData,
  filterBookmarks,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";

const API_URL = "http://localhost:5000/api";

const QuestionBookmarkList = ({ testEmpty }) => {
  const [openIds, setOpenIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const { starredItems, toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  // 서버에서 질문 데이터 가져오기
  const fetchBookmarkedQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (testEmpty) {
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      // 테스트 데이터 사용 (디버깅용)
      const useTestData = false; // true로 설정하면 테스트 데이터 사용
      
      if (useTestData) {
        console.log('테스트 데이터 사용 중...');
        
        // 테스트용 북마크 질문 데이터
        const testQuestions = [
          {
            id: 'test-q1',
            interview: { role: '프론트엔드' },
            type: 'JOB',
            content: 'React의 생명주기에 대해 설명해주세요.',
            myAnswer: 'React 컴포넌트는 마운트, 업데이트, 언마운트 단계로 생명주기가 구성됩니다.',
            recommended: '마운트(constructor, render, componentDidMount), 업데이트(shouldComponentUpdate, render, componentDidUpdate), 언마운트(componentWillUnmount) 등의 메서드가 있습니다.',
            bookmarked: true,
            interviewId: 'test-i1'
          },
          {
            id: 'test-q2',
            interview: { role: '백엔드' },
            type: 'PERSONALITY',
            content: '팀 프로젝트에서 의견 충돌이 있을 때 어떻게 해결하셨나요?',
            myAnswer: '각자의 의견을 존중하며 객관적인 근거를 바탕으로 토론했습니다.',
            recommended: '의견 충돌 시 감정적으로 대응하지 않고, 각 의견의 장단점을 객관적으로 분석하여 팀에 최선의 결정을 내리는 것이 중요합니다.',
            bookmarked: true,
            interviewId: 'test-i2'
          }
        ];
        
        const formattedQuestions = testQuestions.map(q => ({
          id: q.id,
          career: q.interview?.role || '미분류',
          type: q.type === 'JOB' ? '직무' : '인성',
          question: q.content,
          answer: q.myAnswer,
          recommendation: q.recommended,
          bookmarked: q.bookmarked || false,
          interviewId: q.interviewId
        }));
        
        setQuestions(formattedQuestions);
        console.log("테스트 질문 데이터:", formattedQuestions);
        setLoading(false);
        return;
      }
      
      try {
        console.log('API 호출 시작...');
        const response = await axios.get(`${API_URL}/mypage/bookmarks`);
        
        console.log("API 응답 전체:", response);
        console.log("API 응답 데이터:", response.data);
        console.log("API 응답 질문 데이터:", response.data.questions);
        
        if (!response.data || !response.data.questions) {
          console.error('API 응답 형식 오류: questions 필드가 없습니다.', response.data);
          setError('서버 응답 형식이 올바르지 않습니다.');
          setQuestions([]);
          setLoading(false);
          return;
        }
        
        // 서버에서 받은 데이터를 컴포넌트에 맞게 변환
        const formattedQuestions = Array.isArray(response.data.questions) 
          ? response.data.questions.map(q => ({
              id: q.id,
              career: q.interview?.role || '미분류',
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked || false,
              interviewId: q.interviewId
            }))
          : [];
        
        setQuestions(formattedQuestions);
        console.log("변환된 질문 데이터:", formattedQuestions);
      } catch (err) {
        console.error("API 호출 중 오류:", err);
        const errorMessage = err.response 
          ? `API 호출 오류: ${err.message} (상태 코드: ${err.response.status}) - ${JSON.stringify(err.response.data)}`
          : `API 호출 오류: ${err.message || '알 수 없는 오류'} (네트워크 문제)`;
        setError(errorMessage);
        setQuestions([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("질문 데이터를 불러오는 중 오류 발생:", err);
      setError(`질문 데이터 로딩 오류: ${err.message || '알 수 없는 오류'}`);
      setQuestions([]);
      setLoading(false);
    }
  }, [testEmpty]);

  // 북마크 토글 API 호출
  const handleBookmarkToggle = useCallback(async (id) => {
    try {
      console.log(`북마크 토글 API 호출: 질문 ID ${id}`);
      
      // 먼저 로컬 상태 업데이트 (UI 즉시 반영)
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === id ? { ...q, bookmarked: !q.bookmarked } : q
        )
      );
      
      // 별도로 로컬 상태도 토글
      toggleBookmark(id);
      
      try {
        // 백그라운드에서 API 호출 (결과를 기다리지 않음)
        const response = await axios.patch(`${API_URL}/questions/${id}/bookmark`);
        console.log("북마크 토글 응답:", response.data);
        
        // 전체 목록 다시 불러오지 않음 (fetchBookmarkedQuestions 호출 제거)
      } catch (err) {
        console.error("북마크 토글 API 호출 오류:", err);
        const errorMessage = err.response 
          ? `북마크 토글 실패: ${err.message} (상태 코드: ${err.response.status}) - ${JSON.stringify(err.response.data)}`
          : `북마크 토글 실패: ${err.message || '알 수 없는 오류'} (네트워크 문제)`;
        setError(errorMessage);
        
        // API 호출 실패 시 원래 상태로 되돌림
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === id ? { ...q, bookmarked: !q.bookmarked } : q
          )
        );
        toggleBookmark(id);
      }
    } catch (err) {
      console.error("북마크 토글 중 오류 발생:", err);
      setError(`북마크 토글 오류: ${err.message || '알 수 없는 오류'}`);
    }
  }, [toggleBookmark]);

  const filteredData = useMemo(() => {
    return filterBookmarks(
      questions,
      filters.job,
      filters.questionType,
      starredItems,
      testEmpty,
    );
  }, [filters.job, filters.questionType, starredItems, testEmpty, questions]);

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

  // 초기 데이터 가져오기
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
              console.log('API 테스트 호출');
              // 직접 API 요청 테스트
              axios.get('http://localhost:5000/api/mypage/bookmarks')
                .then(response => console.log('테스트 성공:', response.data))
                .catch(err => console.error('테스트 실패:', err));
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
              <>
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
