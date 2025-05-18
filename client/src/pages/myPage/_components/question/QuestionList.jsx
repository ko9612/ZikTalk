import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { useInfiniteScroll } from "@/components/common/useInfiniteScroll";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import EmptyQuestionList from "./EmptyQuestionList";
import {
  Header,
  FilterBar,
  ResultGrid,
  LoadingIndicator,
  ScrollPrompt,
  useQuestionListState,
} from "./settings";

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
  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const { filters, updateFilter } = useFilter({ type: SORT_OPTIONS.LATEST });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  
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

  // 로그인 상태 확인 및 사용자 ID 추출
  useEffect(() => {
    const token = cookies.token;
    if (!token || typeof token !== "string") {
      setIsLoggedIn(false);
      setUserId(null);
      setLoginModalOpen(true); // 로그인되지 않은 상태로 마이페이지 접근 시 바로 모달 표시
      return;
    }
    
    try {
      const decoded = jwtDecode(token); // 토큰 유효성 검증
      const userIdFromToken = decoded.userId || decoded.sub || decoded.id;
      
      if (!userIdFromToken) {
        console.error("토큰에서 사용자 ID를 찾을 수 없습니다.");
        setIsLoggedIn(false);
        setUserId(null);
        setLoginModalOpen(true);
        return;
      }
      
      setIsLoggedIn(true);
      setUserId(userIdFromToken);
      console.log("토큰에서 추출한 사용자 ID:", userIdFromToken);
    } catch (err) {
      console.error("토큰 디코딩 실패:", err);
      setIsLoggedIn(false);
      setUserId(null);
      setLoginModalOpen(true);
    }
  }, [cookies.token]);

  // 로컬 스토리지에서 숨겨진 항목 제거
  useEffect(() => {
    localStorage.removeItem("hiddenQuestions");
  }, []);

  // 추가 데이터 로드 함수
  const loadMoreResults = useCallback(() => {
    if (loading || !hasMore || !isLoggedIn || !userId) return;
    fetchQuestions(page + 1, filters.type, userId);
  }, [page, filters.type, fetchQuestions, loading, hasMore, isLoggedIn, userId]);

  // 무한 스크롤 훅 사용
  const { lastElementRef, userScrolled, setUserScrolled, debounceScrollAction } = 
    useInfiniteScroll(loadMoreResults, hasMore, loading, setLoading);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((type) => {
    if (type === filters.type || !isLoggedIn || !userId) return;
    
    // 부드러운 스크롤 이동
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // 필터 상태 업데이트
    updateFilter("type", type);
    
    // 스크롤 플래그 초기화
    setUserScrolled(false);
    
    // 새로운 필터로 데이터 로드
    fetchQuestions(0, type, userId);
    
    // 스크롤 액션 디바운싱
    debounceScrollAction();
  }, [updateFilter, fetchQuestions, filters.type, setUserScrolled, debounceScrollAction, isLoggedIn, userId]);

  // 항목 선택 토글
  const handleSelectToggle = useCallback((id) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    toggleSelectItem(id);
  }, [toggleSelectItem, isLoggedIn]);

  // 북마크 토글
  const handleBookmarkToggle = useCallback((id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    
    // 현재 필터 모드 확인
    const isBookmarkMode = filters.type === SORT_OPTIONS.BOOKMARK;

    toggleQuestionBookmark(id, userId)
      .then((result) => {
        // 북마크 모드에서는 상태 변경 후 전체 데이터 리로드 불필요
        // 이미 toggleQuestionBookmark 내부에서 올바르게 처리됨
      })
      .catch((err) => {
        console.error("북마크 토글 실패:", err);
      });
  }, [toggleQuestionBookmark, filters.type, isLoggedIn, userId]);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((id) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    
    const item = visibleResults.find((item) => item.id === id);
    if (item?.interviewId) {
      navigate(`/interview-result/${item.interviewId}`);
    }
  }, [navigate, visibleResults, isLoggedIn]);

  // 모달 확인 후 실제 삭제 실행
  const executeDelete = useCallback(() => {
    markAsDeleted(selected, userId);
    setConfirmModalOpen(false);
    const selectedCount = Object.values(selected).filter(Boolean).length;
    setTimeout(() => alert(`${selectedCount}개의 면접 결과가 삭제되었습니다.`), 100);
  }, [markAsDeleted, selected, userId]);

  // 항목 삭제 핸들러
  const handleDeleteItems = useCallback(() => {
    if (!isLoggedIn) {
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
  }, [selected, isLoggedIn]);
  
  // 로그인 페이지 이동
  const handleLogin = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    if (!initialDataLoaded && isLoggedIn && userId) {
      fetchQuestions(0, filters.type, userId);
      setInitialDataLoaded(true);
    }
  }, [initialDataLoaded, fetchQuestions, filters.type, isLoggedIn, userId]);

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
  if (!isLoggedIn) {
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
            if (!isLoggedIn) {
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
