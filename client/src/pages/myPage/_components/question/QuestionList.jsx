import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useInfiniteScroll } from "@/components/common/useInfiniteScroll";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import { useAuth } from "@/hooks/useAuth.js";
import EmptyQuestionList from "./EmptyQuestionList";
import {
  Header,
  FilterBar,
  ResultGrid,
  LoadingIndicator,
  ScrollPrompt,
  useQuestionListState,
} from "./settings";

// 로그 헬퍼 함수 추가
const logDebug = (component, action, data) => {
  console.log(`🔍 [${component}] ${action}:`, data);
};

// 확인 모달 컴포넌트
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onCancel}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">삭제 확인</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

// 로그인 필요 모달
const LoginRequiredModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">로그인 필요</h3>
        <p className="mb-6 text-gray-600">이 기능을 사용하려면 로그인이 필요합니다.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onLogin}
            className="rounded-md bg-zik-main px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionList = () => {
  console.log("🔄 QuestionList 컴포넌트 렌더링");
  const navigate = useNavigate();
  const { filters, updateFilter } = useFilter({ type: SORT_OPTIONS.LATEST });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // useAuth 훅 사용
  const { isAuthenticated, userId, userName, authFetch, fetchQuestions: authFetchQuestions } = useAuth();
  logDebug("QuestionList", "인증 상태", { isAuthenticated, userId, userName });
  
  const {
    state,
    fetchQuestions,
    toggleQuestionBookmark,
    setLoading,
    toggleSelectItem,
    toggleDeleteMode,
    markAsDeleted,
  } = useQuestionListState();

  const { page, visibleResults, hasMore, loading, selected, isDeleteMode, error } = state;
  logDebug("QuestionList", "상태 정보", { 
    page, 
    resultCount: visibleResults.length, 
    hasMore, 
    loading, 
    selectedCount: Object.values(selected).filter(Boolean).length,
    isDeleteMode,
    error
  });

  // 로컬 스토리지에서 숨겨진 항목 제거
  useEffect(() => {
    localStorage.removeItem("hiddenQuestions");
    logDebug("QuestionList", "로컬 스토리지 정리", "hiddenQuestions 삭제됨");
    
    // 로컬 스토리지 내용 확인
    const token = localStorage.getItem("accessToken");
    logDebug("QuestionList", "로컬 스토리지 accessToken", token ? "토큰 존재" : "토큰 없음");
  }, []);

  // 질문 가져오기 - useAuth 훅 사용
  const loadQuestions = useCallback(async (pageNumber, filterType) => {
    logDebug("QuestionList", "loadQuestions 호출", { pageNumber, filterType, isAuthenticated, userId });
    
    if (!isAuthenticated || !userId) {
      logDebug("QuestionList", "loadQuestions 취소", "인증되지 않음");
      return;
    }
    
    try {
      setLoading(true);
      logDebug("QuestionList", "API 호출 시작", { pageNumber, filterType });
      
      const isBookmarked = filterType === SORT_OPTIONS.BOOKMARK;
      const data = await authFetchQuestions(pageNumber, 10, 'date', isBookmarked);
      logDebug("QuestionList", "API 호출 성공", {
        resultCount: data?.length || 0,
        firstItem: data?.[0] ? { id: data[0].id } : "없음",
        isBookmarked
      });
      
      // useQuestionListState에 데이터 전달
      fetchQuestions(pageNumber, filterType, userId, data);
    } catch (error) {
      logDebug("QuestionList", "API 호출 실패", { 
        message: error.message, 
        status: error.response?.status,
        details: error.response?.data
      });
      console.error("질문 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, authFetchQuestions, fetchQuestions, setLoading]);

  // 추가 데이터 로드 함수
  const loadMoreResults = useCallback(() => {
    if (loading || !hasMore || !isAuthenticated || !userId) {
      logDebug("QuestionList", "더 로딩 취소", { loading, hasMore, isAuthenticated });
      return;
    }
    logDebug("QuestionList", "더 로딩 시작", { page: page + 1, filterType: filters.type });
    loadQuestions(page + 1, filters.type);
  }, [page, filters.type, loading, hasMore, isAuthenticated, userId, loadQuestions]);

  // 무한 스크롤 훅 사용
  const { lastElementRef, userScrolled, setUserScrolled, debounceScrollAction } = 
    useInfiniteScroll(loadMoreResults, hasMore, loading, setLoading);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((type) => {
    logDebug("QuestionList", "필터 변경 시도", { currentType: filters.type, newType: type });
    
    if (type === filters.type || !isAuthenticated || !userId) {
      logDebug("QuestionList", "필터 변경 취소", { 같은필터: type === filters.type, 인증여부: isAuthenticated });
      return;
    }
    
    // 부드러운 스크롤 이동
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // 필터 상태 업데이트
    updateFilter("type", type);
    logDebug("QuestionList", "필터 변경됨", { newType: type });
    
    // 스크롤 플래그 초기화
    setUserScrolled(false);
    
    // 새로운 필터로 데이터 로드
    loadQuestions(0, type);
    
    // 스크롤 액션 디바운싱
    debounceScrollAction();
  }, [updateFilter, loadQuestions, filters.type, setUserScrolled, debounceScrollAction, isAuthenticated, userId]);

  // 북마크 토글 - useAuth 훅 사용
  const handleBookmarkToggle = useCallback(async (id, e) => {
    logDebug("QuestionList", "북마크 토글 시도", { questionId: id });
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      logDebug("QuestionList", "북마크 토글 취소", "인증되지 않음");
      setLoginModalOpen(true);
      return;
    }
    
    try {
      logDebug("QuestionList", "북마크 API 호출", { questionId: id, userId });
      // 인증된 요청으로 북마크 토글
      await authFetch(`/questions/${id}/bookmark`, {
        method: 'PATCH',
        data: { userId }
      });
      
      logDebug("QuestionList", "북마크 API 성공", { questionId: id });
      // UI 업데이트
      toggleQuestionBookmark(id, userId);
    } catch (error) {
      logDebug("QuestionList", "북마크 API 실패", { 
        questionId: id, 
        error: error.message, 
        status: error.response?.status 
      });
      console.error("북마크 토글 실패:", error);
    }
  }, [authFetch, toggleQuestionBookmark, isAuthenticated, userId]);

  // 항목 선택 토글
  const handleSelectToggle = useCallback((id) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    toggleSelectItem(id);
    logDebug("QuestionList", "항목 선택 토글", { questionId: id });
  }, [toggleSelectItem, isAuthenticated]);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((id) => {
    logDebug("QuestionList", "카드 클릭", { questionId: id });
    
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    
    const item = visibleResults.find((item) => item.id === id);
    if (item?.interviewId) {
      logDebug("QuestionList", "인터뷰 결과로 이동", { interviewId: item.interviewId });
      navigate(`/interview-result/${item.interviewId}`);
    } else {
      logDebug("QuestionList", "인터뷰 ID 없음", { questionId: id, item });
    }
  }, [navigate, visibleResults, isAuthenticated]);

  // 모달 확인 후 실제 삭제 실행
  const executeDelete = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const selectedIds = Object.entries(selected)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);
      
    logDebug("QuestionList", "삭제 실행", { selectedIds });
    
    try {
      // 인증된 요청으로 삭제 실행
      logDebug("QuestionList", "삭제 API 호출", { count: selectedIds.length });
      
      await authFetch(`/interview/batch-delete`, {
        method: 'POST',
        data: { ids: selectedIds, userId }
      });
      
      logDebug("QuestionList", "삭제 API 성공", { count: selectedIds.length });
      
      // UI 업데이트
      markAsDeleted(selected, userId);
      setConfirmModalOpen(false);
      
      const selectedCount = selectedIds.length;
      setTimeout(() => alert(`${selectedCount}개의 면접 결과가 삭제되었습니다.`), 100);
    } catch (error) {
      logDebug("QuestionList", "삭제 API 실패", { 
        error: error.message, 
        status: error.response?.status,
        details: error.response?.data
      });
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }, [authFetch, markAsDeleted, selected, isAuthenticated, userId]);

  // 항목 삭제 핸들러
  const handleDeleteItems = useCallback(() => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    
    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (selectedCount === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    
    // 모달 표시
    setConfirmMessage(`선택한 ${selectedCount}개의 면접 결과를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`);
    setConfirmModalOpen(true);
  }, [selected, isAuthenticated]);
  
  // 로그인 페이지 이동
  const handleLogin = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    logDebug("QuestionList", "초기 데이터 로드 체크", { 
      initialDataLoaded, 
      isAuthenticated, 
      userId, 
      filterType: filters.type 
    });
    
    if (!initialDataLoaded && isAuthenticated && userId) {
      logDebug("QuestionList", "초기 데이터 로드 시작", { userId, filterType: filters.type });
      loadQuestions(0, filters.type);
      setInitialDataLoaded(true);
    }
  }, [initialDataLoaded, loadQuestions, filters.type, isAuthenticated, userId]);

  // 삭제 모드에서 ESC 키 처리
  useEffect(() => {
    if (!isDeleteMode) return;
    
    const handleKeyDown = (e) => {
      if (e.key === "Escape") toggleDeleteMode();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteMode, toggleDeleteMode]);

  const isEmpty = visibleResults.length === 0 && !loading;
  
  // 로그인하지 않은 상태에서는 로그인 요청 UI만 표시
  if (!isAuthenticated) {
    return (
      <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-8">이 페이지를 이용하려면 로그인이 필요합니다.</p>
          <button
            onClick={handleLogin}
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
        
        <LoginRequiredModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
      <Header showDescription={visibleResults.length > 0} />

      {visibleResults.length > 0 && (
        <FilterBar
          filterValue={filters.type}
          onFilterChange={handleFilterChange}
          isDeleteMode={isDeleteMode}
          onDeleteToggle={() => {
            if (!isAuthenticated) {
              setLoginModalOpen(true);
              return;
            }
            toggleDeleteMode();
          }}
          onDeleteConfirm={handleDeleteItems}
        />
      )}

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">{error}</div>
      )}

      {isEmpty ? (
        <EmptyQuestionList />
      ) : (
        <>
          <ResultGrid
            visibleResults={visibleResults}
            lastElementRef={lastElementRef}
            isDeleteMode={isDeleteMode}
            selected={selected}
            handleSelectToggle={handleSelectToggle}
            handleBookmarkToggle={handleBookmarkToggle}
            handleCardClick={handleCardClick}
          />

          {loading && <LoadingIndicator />}
          {hasMore && !loading && visibleResults.length > 0 && <ScrollPrompt />}
          {!hasMore && !loading && visibleResults.length > 0 && (
            <div className="scroll-spacer my-10 h-2 w-full">
              <div className="text-zik-text/60 my-10 flex w-full items-center justify-center text-sm"></div>
            </div>
          )}
        </>
      )}
      
      <ConfirmModal 
        isOpen={confirmModalOpen}
        message={confirmMessage}
        onConfirm={executeDelete}
        onCancel={() => setConfirmModalOpen(false)}
      />
      
      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default QuestionList;
