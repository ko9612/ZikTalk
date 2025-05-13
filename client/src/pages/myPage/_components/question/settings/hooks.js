import { useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { ACTIONS, PAGE_SIZE } from './constants';
import { prepareInitialData, filterAndSortResults, formatQuestionData } from './utils';
import { SORT_OPTIONS } from "@/components/common/useFilter";
import { fetchQuestions, toggleQuestionBookmark as apiToggleBookmark, getHiddenQuestions, hideQuestion } from '@/api/myPageApi';

// 초기 상태
const initialState = {
  results: [],
  page: 0,
  visibleResults: [],
  hasMore: true,
  loading: false,
  selected: {},
  isDeleteMode: false,
  totalCount: 0,
  error: null
};

// 리듀서 함수
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };
    case ACTIONS.SET_VISIBLE_RESULTS:
      return { ...state, visibleResults: action.payload };
    case ACTIONS.SET_RESULTS:
      return { ...state, results: action.payload };
    case ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_TOTAL_COUNT:
      return { ...state, totalCount: action.payload };
    case ACTIONS.TOGGLE_SELECT:
      return { 
        ...state, 
        selected: { 
          ...state.selected, 
          [action.payload]: !state.selected[action.payload] 
        } 
      };
    case ACTIONS.TOGGLE_DELETE_MODE:
      return { ...state, isDeleteMode: !state.isDeleteMode };
    case ACTIONS.CLEAR_SELECTED:
      return { ...state, selected: {} };
    case ACTIONS.RESET_PAGINATION:
      return { 
        ...state, 
        page: 0, 
        visibleResults: action.payload.slice(0, PAGE_SIZE),
        hasMore: action.payload.length > PAGE_SIZE 
      };
    case ACTIONS.DELETE_ITEMS:
      // 항목을 실제로 삭제하는 대신 UI에서만 제거
      const visibleAfterDelete = state.visibleResults.filter(item => !state.selected[item.id]);
      return {
        ...state,
        visibleResults: visibleAfterDelete,
        selected: {},
        isDeleteMode: false
      };
    case ACTIONS.MARK_AS_DELETED:
      // 지정된 ID 목록의 항목에 isDeleted 플래그 설정
      const itemsToDelete = action.payload;
      const resultsWithDeletedFlag = state.results.map(item => 
        itemsToDelete.includes(item.id) 
          ? { ...item, isDeleted: true } 
          : item
      );
      
      return {
        ...state,
        results: resultsWithDeletedFlag,
        selected: {},
        isDeleteMode: false
      };
    default:
      return state;
  }
}

/**
 * 질문 목록 상태 관리 훅
 */
export function useQuestionListState(props) {
  // 리듀서 설정
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 질문 데이터 불러오기
  const fetchQuestionsData = useCallback(async (page = 0, sortType = SORT_OPTIONS.LATEST) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      
      // 이미 요청한 페이지라면 중복 요청 방지
      if (page > 0 && page <= state.page && state.results.length > 0) {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return;
      }
      
      // 북마크 여부와 정렬 방식 결정
      const isBookmarked = sortType === SORT_OPTIONS.BOOKMARK;
      const sortBy = sortType === SORT_OPTIONS.LATEST ? 'date' : 'bookmark';
      
      // API 호출
      const data = await fetchQuestions(page + 1, PAGE_SIZE, sortBy, isBookmarked);
      
      if (!data) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }
      
      // 서버 응답이 배열인 경우 직접 questions 배열로 처리
      const questions = Array.isArray(data) ? data : data.questions;
      // 서버 응답에 total이 없는 경우 배열 길이를 total로 사용
      const total = data.total || (questions ? questions.length : 0);
      
      if (!questions) {
        throw new Error("응답에서 질문 데이터를 찾을 수 없습니다.");
      }
      
      // 숨겨진 질문 목록 가져오기
      const hiddenQuestions = getHiddenQuestions();
      
      // 숨겨진 질문 필터링
      const filteredQuestions = questions.filter(q => !hiddenQuestions.includes(q.id));
      
      // 데이터가 더 없으면 hasMore를 false로 설정
      const hasMoreData = filteredQuestions.length > 0 && (page + 1) * PAGE_SIZE < total;
      
      // 응답 데이터 처리
      const formattedQuestions = filteredQuestions.map((q, index) => formatQuestionData(q, index, page * PAGE_SIZE));
      
      // 정렬 (필터 타입에 따라 다르게 적용)
      let sortedResults;
      if (sortType === SORT_OPTIONS.LATEST) {
        // 최신순: 북마크 상태와 무관하게 날짜순으로만 정렬
        sortedResults = formattedQuestions.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortType === SORT_OPTIONS.BOOKMARK) {
        // 북마크순: 북마크된 항목이 상단에 오도록 정렬
        sortedResults = formattedQuestions.sort((a, b) => {
          // 북마크 상태가 다르면 북마크된 것이 먼저 오도록
          if (a.bookmarked !== b.bookmarked) {
            return a.bookmarked ? -1 : 1;
          }
          // 북마크 상태가 같으면 날짜순 정렬
          return new Date(b.date) - new Date(a.date);
        });
      } else {
        // 기본값: 날짜순 정렬
        sortedResults = formattedQuestions.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      // 상태 업데이트
      if (page === 0) {
        dispatch({ type: ACTIONS.SET_RESULTS, payload: sortedResults });
        // 초기 페이지에는 최대 PAGE_SIZE 개수만 표시
        dispatch({ type: ACTIONS.SET_VISIBLE_RESULTS, payload: sortedResults.slice(0, PAGE_SIZE) });
      } else {
        // 기존 결과와 새 결과를 병합
        const updatedResults = [...state.results, ...sortedResults];
        
        // ID 기준으로 중복 제거하면서 북마크 상태 유지
        const idMap = new Map();
        
        // 먼저 기존 결과(state.results)의 상태를 보존
        state.results.forEach(item => {
          idMap.set(item.originalId, item);
        });
        
        // 새 결과에서 없는 항목만 추가하거나, 기존 항목의 북마크 상태를 유지
        sortedResults.forEach(item => {
          const existingItem = idMap.get(item.originalId);
          if (existingItem) {
            // 기존 항목이 있으면 북마크 상태를 유지하면서 다른 정보 업데이트
            idMap.set(item.originalId, {
              ...item,
              bookmarked: existingItem.bookmarked
            });
          } else {
            // 새 항목은 그대로 추가
            idMap.set(item.originalId, item);
          }
        });
        
        // Map을 배열로 변환
        const uniqueResults = Array.from(idMap.values());
        
        dispatch({ type: ACTIONS.SET_RESULTS, payload: uniqueResults });
        // 스크롤 시 추가 데이터를 포함하여 현재 페이지까지의 데이터 표시
        dispatch({ 
          type: ACTIONS.SET_VISIBLE_RESULTS, 
          payload: uniqueResults.slice(0, (page + 1) * PAGE_SIZE) 
        });
      }
      
      dispatch({ type: ACTIONS.SET_PAGE, payload: page });
      // 숨겨진 항목을 고려한 총 개수 계산
      const adjustedTotal = Math.max(0, total - (questions.length - filteredQuestions.length));
      dispatch({ type: ACTIONS.SET_TOTAL_COUNT, payload: adjustedTotal });
      dispatch({ type: ACTIONS.SET_HAS_MORE, payload: hasMoreData });
    } catch (error) {
      // 상세 오류 메시지 출력
      if (error.response) {
        // 서버가 응답을 반환했지만 2xx 범위가 아닌 상태 코드
        dispatch({ type: ACTIONS.SET_ERROR, payload: `서버 오류: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}` });
      } else if (error.request) {
        // 요청이 발생했지만 응답을 받지 못함
        dispatch({ type: ACTIONS.SET_ERROR, payload: "서버와 통신할 수 없습니다. 서버가 실행 중인지 확인해주세요." });
      } else {
        // 요청 설정 중에 오류가 발생
        dispatch({ type: ACTIONS.SET_ERROR, payload: `요청 오류: ${error.message}` });
      }
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.page, state.results.length]);
  
  // 북마크 토글 함수
  const toggleQuestionBookmark = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    const targetQuestion = state.results.find(q => q.id === id);
    if (!targetQuestion) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return Promise.reject(new Error("북마크할 항목을 찾을 수 없습니다."));
    }
    
    const originalId = targetQuestion.originalId;
    const newBookmarkState = !targetQuestion.bookmarked;
    
    // 상태 낙관적 업데이트
    const updatedResults = state.results.map(q => 
      q.id === id ? { ...q, bookmarked: newBookmarkState } : q
    );
    
    // visibleResults도 함께 업데이트하여 UI에 즉시 반영
    const updatedVisibleResults = updatedResults.slice(0, (state.page + 1) * PAGE_SIZE);
    
    dispatch({ type: ACTIONS.SET_RESULTS, payload: updatedResults });
    dispatch({ 
      type: ACTIONS.SET_VISIBLE_RESULTS, 
      payload: updatedVisibleResults
    });
    
    try {
      // API 호출
      await apiToggleBookmark(originalId, newBookmarkState);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return Promise.resolve({ success: true, bookmarked: newBookmarkState });
    } catch (error) {
      // 오류 발생 시 상태 롤백
      const rollbackResults = state.results.map(q => 
        q.id === id ? { ...q, bookmarked: !newBookmarkState } : q
      );
      
      const rollbackVisibleResults = rollbackResults.slice(0, (state.page + 1) * PAGE_SIZE);
      
      dispatch({ type: ACTIONS.SET_RESULTS, payload: rollbackResults });
      dispatch({ 
        type: ACTIONS.SET_VISIBLE_RESULTS, 
        payload: rollbackVisibleResults
      });
      
      dispatch({ type: ACTIONS.SET_ERROR, payload: "북마크 업데이트 중 오류가 발생했습니다." });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return Promise.reject(error);
    }
  }, [state.results, state.page]);
  
  // 정렬 및 필터링 함수
  const getSortedResultsByType = useCallback((type, starredItems) => {
    return filterAndSortResults(state.results, type, starredItems);
  }, [state.results]);

  // 상태 변경 함수들
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading });
  }, []);

  const toggleSelectItem = useCallback((id) => {
    dispatch({ type: ACTIONS.TOGGLE_SELECT, payload: id });
  }, []);

  const toggleDeleteMode = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_DELETE_MODE });
  }, []);

  const deleteSelectedItems = useCallback(() => {
    dispatch({ type: ACTIONS.DELETE_ITEMS });
  }, []);

  // 선택된 항목을 UI에서 제거하는 함수
  const markAsDeleted = useCallback(async (selectedItems) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // 선택된 항목의 ID 배열 추출
      const itemsToDelete = Object.keys(selectedItems)
        .filter(id => selectedItems[id])
        .map(id => parseInt(id, 10) || id); // ID가 숫자인 경우 변환
      
      if (itemsToDelete.length === 0) return;
      
      // 로컬 스토리지에 숨김 처리
      for (const id of itemsToDelete) {
        const item = state.results.find(q => q.id === id);
        if (item) {
          hideQuestion(item.originalId);
        }
      }
      
      // UI에서 항목 제거
      const updatedVisibleResults = state.visibleResults.filter(
        item => !itemsToDelete.includes(item.id)
      );
      
      const updatedResults = state.results.filter(
        item => !itemsToDelete.includes(item.id)
      );
      
      // 상태 업데이트
      dispatch({ type: ACTIONS.SET_RESULTS, payload: updatedResults });
      dispatch({ 
        type: ACTIONS.SET_VISIBLE_RESULTS, 
        payload: updatedVisibleResults 
      });
      
      // 선택 상태 초기화
      dispatch({ type: ACTIONS.CLEAR_SELECTED });
      
      // 삭제 모드 종료
      dispatch({ type: ACTIONS.TOGGLE_DELETE_MODE });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: "항목 삭제 중 오류가 발생했습니다." });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.visibleResults, state.results]);

  const resetPagination = useCallback((data) => {
    dispatch({ type: ACTIONS.RESET_PAGINATION, payload: data });
  }, []);

  const loadMoreItems = useCallback((sortedData, nextPage) => {
    const newResults = sortedData.slice(0, (nextPage + 1) * PAGE_SIZE);
    
    dispatch({ type: ACTIONS.SET_VISIBLE_RESULTS, payload: newResults });
    dispatch({ type: ACTIONS.SET_PAGE, payload: nextPage });
    dispatch({ type: ACTIONS.SET_HAS_MORE, payload: newResults.length < sortedData.length });
    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  }, []);

  // 반환 객체
  return {
    state,
    fetchQuestions: fetchQuestionsData, // 하위 호환성 유지
    toggleQuestionBookmark,
    getSortedResultsByType,
    setLoading,
    toggleSelectItem,
    toggleDeleteMode,
    markAsDeleted,
    deleteSelectedItems,
    resetPagination,
    loadMoreItems
  };
} 