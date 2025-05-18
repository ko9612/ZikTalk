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
import CommonModal from "@/components/common/Modal/CommonModal";

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
    isDelaying,
    resetAllStates,
  } = useInfiniteScroll(loadMoreResults, hasMore, loading, setLoading);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (type) => {
      if (type === filters.type || !loginState || !userId) return;

      console.log(`[필터] 필터 변경 시작: ${filters.type} → ${type}`);

      // 먼저 모든 상태 리셋 (이전 필터 관련 상태 초기화)
      if (typeof resetAllStates === 'function') {
        resetAllStates();
      }
      
      // 로딩 상태 설정 (로딩 인디케이터 표시)
      setLoading(true);
      
      // 필터 상태 업데이트
      updateFilter("type", type);

      // 스크롤 플래그 설정 - true로 유지 (스크롤 감지 활성화)
      setUserScrolled(true);

      // 새로운 필터로 데이터 로드 (페이지 번호 0으로 리셋)
      fetchQuestions(0, type, userId);

      // 스크롤 액션 디바운싱 - 데이터 로드 후 지연 설정
      debounceScrollAction();
      
      // 상태 정리를 위한 단계적 검사 및 초기화
      const sequence = [
        // 1단계: 400ms 후 스크롤 활성화
        () => {
          console.log("[필터] 단계 1: 스크롤 감지 활성화");
          setUserScrolled(true);
        },
        
        // 2단계: 800ms 후 디바운싱 상태 확인 및 강제 초기화 
        () => {
          console.log("[필터] 단계 2: 디바운싱 상태 초기화");
          if (typeof resetAllStates === 'function') {
            resetAllStates();
          }
        },
        
        // 3단계: 1500ms 후 최종 상태 확인 및 필요시 재초기화
        () => {
          console.log("[필터] 단계 3: 최종 상태 확인");
          setUserScrolled(true);
          if (typeof resetAllStates === 'function') {
            resetAllStates();
          }
          // 로딩이 계속되고 있다면 강제 종료
          setLoading(false);
        },
        
        // 4단계: 2200ms 후 스크롤 이벤트 다시 트리거
        () => {
          console.log("[필터] 단계 4: 스크롤 이벤트 재트리거");
          // 강제로 스크롤 이벤트 발생시켜 체크 유도
          window.dispatchEvent(new Event('scroll'));
          setUserScrolled(true);
        }
      ];
      
      // 각 단계 순차 실행 - 타이밍 증가
      sequence.forEach((step, index) => {
        setTimeout(step, 500 + (index * 600));
      });
    },
    [
      updateFilter,
      fetchQuestions,
      filters.type,
      setUserScrolled,
      debounceScrollAction,
      loginState,
      userId,
      resetAllStates,
      setLoading,
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

      {confirmModalOpen && (
        <CommonModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="삭제 확인"
          subText={confirmMessage}
          btnText="삭제하기"
          btnHandler={executeDelete}
        />
      )}
    </div>
  );
};

export default QuestionList;
