import { useReducer, useCallback, useMemo } from 'react';
import { ACTIONS, PAGE_SIZE } from './constants';
import { prepareInitialData, filterAndSortResults } from './utils';
import { SORT_OPTIONS } from "../../common/useFilter";

// 초기 상태
const initialState = {
  results: [],
  page: 0,
  visibleResults: [],
  hasMore: true,
  loading: false,
  selected: {},
  isDeleteMode: false
};

// 리듀서 함수
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };
    case ACTIONS.SET_VISIBLE_RESULTS:
      return { ...state, visibleResults: action.payload };
    case ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
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
      const newResults = state.results.filter(item => !state.selected[item.id]);
      return {
        ...state,
        results: newResults,
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
  // 초기 데이터 준비
  const initialResults = useMemo(() => props?.results ?? prepareInitialData(), [props?.results]);
  
  // 리듀서 설정
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    results: initialResults
  });
  
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

  return {
    state,
    getSortedResultsByType,
    setLoading,
    toggleSelectItem,
    toggleDeleteMode,
    deleteSelectedItems,
    resetPagination,
    loadMoreItems
  };
} 