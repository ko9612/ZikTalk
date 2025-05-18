import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteScroll } from "@/components/common/useInfiniteScroll";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { loginInfo } from "@/store/loginStore";
import { fetchBookmarks, toggleQuestionBookmark } from "@/api/myPageApi";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";
import FaqItem from "@/components/common/FaqItem";
import axiosInstance from "@/api/axiosInstance";

// 북마크 질문 목록 상태 관리 훅
const useBookmarkListState = () => {
  const [page, setPage] = useState(0);
  const [visibleResults, setVisibleResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);

  // 북마크된 질문 가져오기
  const fetchBookmarkedQuestions = useCallback(async (pageNum, filters, userId) => {
    if (!userId) {
      console.error("[ERROR] 북마크 데이터 로드 실패: 사용자 ID가 없습니다");
      setError("로그인이 필요한 기능입니다.");
      setLoading(false);
      return;
    }
    
    if (loading) {
      console.log("[DEBUG] 이미 로딩 중이므로 추가 요청 무시");
      return;
    }
    
    if (pageNum > 0 && !hasMore) {
      console.log("[DEBUG] 더 이상 불러올 데이터가 없습니다");
      return;
    }
    
    // Authorization 헤더 유무 체크 (토큰 만료 확인용)
    const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
    if (!hasAuthHeader) {
      console.warn("[ERROR] Authorization 헤더가 없습니다. 로그인 세션이 만료되었습니다.");
      setError("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      setLoading(false);
      
      // 로그아웃 처리
      const { logout } = loginInfo.getState();
      if (logout) {
        logout();
      }
      
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[DEBUG] 북마크 API 호출 파라미터:", { 
        page: pageNum + 1, 
        pageSize: PAGE_SIZE, 
        filters: { ...filters, bookmarked: true }, 
        userId,
        loadingState: loading 
      });
      
      const response = await fetchBookmarks(pageNum + 1, PAGE_SIZE, { ...filters, bookmarked: true }, userId);
      console.log("[DEBUG] 북마크 API 응답:", response);

      if (!response || !response.questions) {
        setError("서버 응답 형식이 올바르지 않습니다.");
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
              bookmarked: true,
              interviewId: q.interviewId,
              userId: q.userId,
            }))
            .filter((q) => q.userId === userId)
        : [];

      console.log("[DEBUG] 필터링된 북마크 질문 수:", formattedQuestions.length);
      
      if (pageNum === 0) {
        setVisibleResults(formattedQuestions);
      } else {
        setVisibleResults(prev => [...prev, ...formattedQuestions]);
      }
      
      setPage(pageNum);
      setHasMore(formattedQuestions.length === PAGE_SIZE);
      setLoading(false);
    } catch (err) {
      console.error("[ERROR] 북마크 데이터 로딩 오류:", err);
      
      // 인증 오류 처리 (401, CORS 오류 등)
      if (err.isLoggedOut || 
          (err.response && err.response.status === 401) ||
          err.message.includes("Network Error")) {
        setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        
        // 로그인 상태 확인 및 갱신
        const { logout } = loginInfo.getState();
        if (logout) {
          console.log("[인증 오류] 로그인 세션이 만료되어 로그아웃 처리합니다.");
          logout();
          
          // 헤더 초기화
          delete axiosInstance.defaults.headers.common["Authorization"];
        }
      } else {
        setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      }
      
      setLoading(false);
    }
  }, [hasMore, loading]);

  // 북마크 토글
  const toggleBookmark = useCallback(async (id, userId) => {
    if (!userId) {
      console.error("[ERROR] 북마크 토글 실패: 사용자 ID가 없습니다");
      setError("로그인이 필요한 기능입니다.");
      return false;
    }

    try {
      setVisibleResults((prev) => {
        const index = prev.findIndex((q) => q.id === id);
        if (index === -1) return prev;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          bookmarked: !updated[index].bookmarked,
        };
        return updated;
      });

      console.log("[DEBUG] 북마크 토글 API 호출:", id, "사용자 ID:", userId);
      await toggleQuestionBookmark(id, userId);
      console.log("[DEBUG] 북마크 토글 성공");
      
      // 북마크 목록에서 제거
      setVisibleResults((prev) => prev.filter((q) => q.id !== id));
      
      return true;
    } catch (err) {
      console.error("[ERROR] 북마크 토글 실패:", err);
      setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
      
      // 실패시 상태 원복
      setVisibleResults((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
        ),
      );
      
      return false;
    }
  }, []);

  // 확장 토글
  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id]
    );
  }, []);

  return {
    state: {
      page,
      visibleResults,
      hasMore,
      loading,
      error,
      openIds,
    },
    fetchBookmarkedQuestions,
    toggleBookmark,
    toggleOpen,
    setLoading,
    setError,
  };
};

const QuestionBookmarkList = ({ testEmpty }) => {
  const navigate = useNavigate();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const userId = loginInfo((state) => state.userId);
  const loginState = loginInfo((state) => state.loginState);
  
  // userId 확인 로깅
  useEffect(() => {
    console.log("[로그인 상태]", { loginState, userId, initialDataLoaded });
  }, [loginState, userId, initialDataLoaded]);
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  const {
    state,
    fetchBookmarkedQuestions,
    toggleBookmark,
    toggleOpen,
    setLoading,
    setError,
  } = useBookmarkListState();

  const {
    page,
    visibleResults,
    hasMore,
    loading,
    error,
    openIds,
  } = state;

  // 추가 데이터 로드 함수
  const loadMoreResults = useCallback(() => {
    if (!loginState) {
      console.log("[스크롤] 로그인 상태가 아님");
      return;
    }
    
    if (!userId) {
      console.log("[스크롤] 사용자 ID가 없음");
      return;
    }
    
    if (loading) {
      console.log("[스크롤] 이미 로딩 중");
      return;
    }
    
    if (!hasMore) {
      console.log("[스크롤] 더 이상 불러올 데이터가 없음");
      return;
    }
    
    // testEmpty가 true면 데이터를 가져오지 않음
    if (testEmpty) {
      console.log("[스크롤] testEmpty가 true라 데이터를 가져오지 않음");
      return;
    }
    
    console.log("[스크롤] 추가 데이터 로드 시작", {
      page: page + 1,
      userId,
      filterJob: filters.job,
      filterType: filters.questionType
    });
    
    fetchBookmarkedQuestions(page + 1, filters, userId);
  }, [
    page,
    filters,
    fetchBookmarkedQuestions,
    loading,
    hasMore,
    loginState,
    userId,
    testEmpty,
  ]);

  // 무한 스크롤 훅 사용
  const {
    lastElementRef,
    userScrolled,
    setUserScrolled,
    debounceScrollAction,
    isDelaying,
    resetAllStates,
  } = useInfiniteScroll(loadMoreResults, hasMore, loading, setLoading);

  // 필터 변경 핸들러 - job
  const handleJobFilterChange = useCallback(
    (value) => {
      if (!loginState || !userId) {
        navigate("/signin");
        return;
      }

      console.log(`[필터] 직무 필터 변경: ${filters.job} → ${value}`);

      // 상태 초기화
      if (typeof resetAllStates === 'function') {
        resetAllStates();
      }
      
      // 로딩 상태 설정
      setLoading(true);
      
      // 필터 상태 업데이트
      updateFilter("job", value);
      
      // 스크롤 플래그 설정
      setUserScrolled(true);
      
      // 새 필터로 데이터 로드
      fetchBookmarkedQuestions(0, { ...filters, job: value }, userId);
      
      // 디바운싱
      debounceScrollAction();
    },
    [
      updateFilter,
      filters,
      fetchBookmarkedQuestions,
      loginState,
      userId,
      navigate,
      resetAllStates,
      setLoading,
      setUserScrolled,
      debounceScrollAction,
    ],
  );

  // 필터 변경 핸들러 - questionType
  const handleTypeFilterChange = useCallback(
    (value) => {
      if (!loginState || !userId) {
        navigate("/signin");
        return;
      }

      console.log(`[필터] 질문 유형 필터 변경: ${filters.questionType} → ${value}`);

      // 상태 초기화
      if (typeof resetAllStates === 'function') {
        resetAllStates();
      }
      
      // 로딩 상태 설정
      setLoading(true);
      
      // 필터 상태 업데이트
      updateFilter("questionType", value);
      
      // 스크롤 플래그 설정
      setUserScrolled(true);
      
      // 새 필터로 데이터 로드
      fetchBookmarkedQuestions(0, { ...filters, questionType: value }, userId);
      
      // 디바운싱
      debounceScrollAction();
    },
    [
      updateFilter,
      filters,
      fetchBookmarkedQuestions,
      loginState,
      userId,
      navigate,
      resetAllStates,
      setLoading,
      setUserScrolled,
      debounceScrollAction,
    ],
  );

  // 북마크 토글 핸들러
  const handleBookmarkToggle = useCallback(
    async (id) => {
      if (!loginState || !userId) {
        console.error("[ERROR] 북마크 토글 실패: 로그인되지 않음");
        setError("로그인이 필요한 기능입니다.");
        navigate("/signin");
        return;
      }

      try {
        // Authorization 헤더 확인
        const authHeader = axiosInstance.defaults.headers.common["Authorization"];
        if (!authHeader) {
          console.warn("[북마크 토글] Authorization 헤더가 없음");
          setError("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/signin");
          return;
        }

        console.log("[북마크 토글] 시작, ID:", id, "사용자 ID:", userId);
        const result = await toggleBookmark(id, userId);
        console.log("[북마크 토글] 결과:", result ? "성공" : "실패");
      } catch (err) {
        console.error("[ERROR] 북마크 토글 중 예외 발생:", err);
        
        // 인증 오류 처리
        if (err.isLoggedOut || (err.response && err.response.status === 401)) {
          setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/signin");
        } else {
          setError(`북마크 토글 실패: ${err.message || "알 수 없는 오류"}`);
        }
      }
    },
    [toggleBookmark, loginState, userId, navigate, setError],
  );

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    // 로그인 상태와 userId 확인
    if (!initialDataLoaded && loginState && userId && !testEmpty) {
      console.log("[초기화] 북마크 데이터 로드 시작, 사용자 ID:", userId);
      
      // Authorization 헤더 확인
      const authHeader = axiosInstance.defaults.headers.common["Authorization"];
      console.log("[초기화] Authorization 헤더 상태:", !!authHeader);
      
      // 헤더 없을 경우 인증 에러 표시
      if (!authHeader) {
        console.warn("[초기화] Authorization 헤더가 없습니다. 로그인을 다시 시도해주세요.");
        setError("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        
        // 로그아웃 처리
        const { logout } = loginInfo.getState();
        if (logout) {
          logout();
          setTimeout(() => navigate("/signin"), 1500);
        }
      } else {
        // 데이터 로드 시도
        fetchBookmarkedQuestions(0, filters, userId);
      }
      
      setInitialDataLoaded(true);
    } else if (!initialDataLoaded) {
      console.log("[초기화] 데이터 로드 건너뜀:", { 
        loginState, 
        userId, 
        testEmpty, 
        initialDataLoaded 
      });
      
      // testEmpty가 true이거나 로그인 정보가 없는 경우 초기화 완료 처리
      if (testEmpty || !loginState || !userId) {
        setInitialDataLoaded(true);
      }
    }
  }, [initialDataLoaded, fetchBookmarkedQuestions, filters, loginState, userId, testEmpty, navigate, setError]);

  const isEmpty = visibleResults.length === 0 && !loading;

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
          {error.includes("로그인") ? (
            <button
              className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
              onClick={() => {
                navigate("/signin");
              }}
            >
              로그인 페이지로 이동
            </button>
          ) : (
            <button
              className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
              onClick={() => {
                console.log("[DEBUG] 재시도 버튼 클릭");
                
                // Authorization 헤더 확인
                const authHeader = axiosInstance.defaults.headers.common["Authorization"];
                console.log("[DEBUG] Authorization 헤더 상태:", !!authHeader);
                
                if (loginState && userId) {
                  // 데이터 다시 로드 시도
                  fetchBookmarkedQuestions(0, filters, userId);
                } else {
                  navigate("/signin");
                }
              }}
            >
              다시 시도
            </button>
          )}
        </div>
      )}

      {isEmpty ? (
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
            {loading && visibleResults.length === 0 ? (
              <LoadingIndicator />
            ) : (
              <div className="min-h-[350px] p-2">
                {visibleResults.map((item, index) => (
                  <div key={item.id} ref={index === visibleResults.length - 1 ? lastElementRef : null}>
                    <FaqItem
                      id={item.id}
                      displayId={index + 1}
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

            {loading && visibleResults.length > 0 && <LoadingIndicator />}
            
            {hasMore && !loading && visibleResults.length > 0 && (
              <div className="my-10 flex w-full items-center justify-center">
                <span className="text-zik-text/60 cursor-pointer text-sm">
                  아래로 스크롤하여 더 보기
                </span>
              </div>
            )}
            
            {!hasMore && !loading && visibleResults.length > 0 && (
              <div className="scroll-spacer my-10 h-2 w-full">
                <div className="text-zik-text/60 my-10 flex w-full items-center justify-center text-sm"></div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
