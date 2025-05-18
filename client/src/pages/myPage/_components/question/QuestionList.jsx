import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { loginInfo } from "@/store/loginStore";

// 확인 모달 컴포넌트
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onCancel}
      ></div>
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

const QuestionList = () => {
  const navigate = useNavigate();
  const { filters, updateFilter } = useFilter({ type: SORT_OPTIONS.LATEST });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const userId = loginInfo((state) => state.userId);
  const loginState = loginInfo((state) => state.loginState);

  const {
    state,
    fetchQuestions,
    toggleQuestionBookmark,
    setLoading,
    toggleSelectItem,
    toggleDeleteMode,
    markAsDeleted,
  } = useQuestionListState();

  const {
    page,
    visibleResults,
    hasMore,
    loading,
    selected,
    isDeleteMode,
    error,
  } = state;

  // 로컬 스토리지에서 숨겨진 항목 제거
  useEffect(() => {
    localStorage.removeItem("hiddenQuestions");
  }, []);

  // 추가 데이터 로드 함수
  const loadMoreResults = useCallback(() => {
    if (loading || !hasMore || !loginState || !userId) return;
    fetchQuestions(page + 1, filters.type, userId);
  }, [
    page,
    filters.type,
    fetchQuestions,
    loading,
    hasMore,
    loginState,
    userId,
  ]);

  // 무한 스크롤 훅 사용
  const {
    lastElementRef,
    userScrolled,
    setUserScrolled,
    debounceScrollAction,
  } = useInfiniteScroll(loadMoreResults, hasMore, loading, setLoading);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (type) => {
      if (type === filters.type || !loginState || !userId) return;

      // 부드러운 스크롤 이동
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // 필터 상태 업데이트
      updateFilter("type", type);

      // 스크롤 플래그 초기화
      setUserScrolled(false);

      // 새로운 필터로 데이터 로드
      fetchQuestions(0, type, userId);

      // 스크롤 액션 디바운싱
      debounceScrollAction();
    },
    [
      updateFilter,
      fetchQuestions,
      filters.type,
      setUserScrolled,
      debounceScrollAction,
      loginState,
      userId,
    ],
  );

  // 항목 선택 토글
  const handleSelectToggle = useCallback(
    (id) => {
      toggleSelectItem(id);
    },
    [toggleSelectItem, loginState],
  );

  // 북마크 토글
  const handleBookmarkToggle = useCallback(
    (id, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
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
    },
    [toggleQuestionBookmark, filters.type, loginState, userId],
  );

  // 카드 클릭 핸들러
  const handleCardClick = useCallback(
    (id) => {
      const item = visibleResults.find((item) => item.id === id);
      if (item?.interviewId) {
        navigate(`/interview-result/${item.interviewId}`);
      }
    },
    [navigate, visibleResults, loginState],
  );

  // 모달 확인 후 실제 삭제 실행
  const executeDelete = useCallback(() => {
    markAsDeleted(selected, userId);
    setConfirmModalOpen(false);
    const selectedCount = Object.values(selected).filter(Boolean).length;
    setTimeout(
      () => alert(`${selectedCount}개의 면접 결과가 삭제되었습니다.`),
      100,
    );
  }, [markAsDeleted, selected, userId]);

  // 항목 삭제 핸들러
  const handleDeleteItems = useCallback(() => {
    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (selectedCount === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    // 모달 표시
    setConfirmMessage(
      `선택한 ${selectedCount}개의 면접 결과를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    );
    setConfirmModalOpen(true);
  }, [selected, loginState]);

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    if (!initialDataLoaded && loginState && userId) {
      fetchQuestions(0, filters.type, userId);
      setInitialDataLoaded(true);
    }
  }, [initialDataLoaded, fetchQuestions, filters.type, loginState, userId]);

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

  return (
    <div className="max-w-9xl mx-auto w-full px-2 pt-6 sm:px-3">
      <Header showDescription={visibleResults.length > 0} />

      {visibleResults.length > 0 && (
        <FilterBar
          filterValue={filters.type}
          onFilterChange={handleFilterChange}
          isDeleteMode={isDeleteMode}
          onDeleteToggle={() => {
            toggleDeleteMode();
          }}
          onDeleteConfirm={handleDeleteItems}
        />
      )}

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
        </div>
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
    </div>
  );
};

export default QuestionList;
