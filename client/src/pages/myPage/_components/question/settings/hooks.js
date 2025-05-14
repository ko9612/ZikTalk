import { useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { ACTIONS, PAGE_SIZE, SCROLL_BATCH_SIZE } from './constants';
import { prepareInitialData, filterAndSortResults, formatQuestionData } from './utils';
import { SORT_OPTIONS } from "@/components/common/useFilter";
import { fetchQuestions, fetchInterviewsWithFirstQuestion, toggleQuestionBookmark as apiToggleBookmark, toggleInterviewBookmark, getHiddenQuestions, batchDeleteInterviews } from '@/api/myPageApi';

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
      console.log(`[DEBUG] 데이터 로드 시작 - 페이지: ${page}, 정렬: ${sortType}`);
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      
      // 이미 요청한 페이지라면 중복 요청 방지
      if (page > 0 && page <= state.page && state.results.length > 0) {
        console.log(`[DEBUG] 이미 요청한 페이지 스킵: ${page}`);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return;
      }
      
      // 북마크 여부와 정렬 방식 결정
      const isBookmarked = sortType === SORT_OPTIONS.BOOKMARK;
      const sortBy = sortType === SORT_OPTIONS.LATEST ? 'date' : 'bookmark';
      
      // 초기 로드인지 확인 (페이지가 0이면 초기 로드)
      const isInitialLoad = page === 0;
      
      console.log(`[DEBUG] API 호출 파라미터: page=${page+1}, pageSize=${SCROLL_BATCH_SIZE}, sortBy=${sortBy}, isBookmarked=${isBookmarked}, isInitialLoad=${isInitialLoad}`);
      
      // 면접 API 호출 (각 면접당 첫 번째 질문만 포함)
      const data = await fetchInterviewsWithFirstQuestion(page + 1, SCROLL_BATCH_SIZE, sortBy, isBookmarked, isInitialLoad);
      
      console.log(`[DEBUG] API 응답 데이터:`, data);
      
      if (!data) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }
      
      // 총 개수 또는 기본 개수 
      const total = data.length;
      console.log(`[DEBUG] 총 데이터 개수: ${total}`);
      
      // 숨겨진 질문 목록 가져오기
      const hiddenQuestions = getHiddenQuestions();
      console.log(`[DEBUG] 숨겨진 질문 목록:`, hiddenQuestions);
      
      // 데이터 형식 변환 (면접 + 첫 번째 질문)
      const formattedData = data.map((interview, index) => {
        // 각 면접의 첫 번째 질문 가져오기
        const firstQuestion = interview.questions && interview.questions.length > 0
          ? interview.questions[0]
          : null;
        
        console.log(`[DEBUG] 면접 ID ${interview.id}의 첫 번째 질문:`, firstQuestion);
        
        // 질문이 없는 경우 기본 데이터로 생성
        if (!firstQuestion) {
          return {
            id: index + 1,
            originalId: interview.id,
            interviewId: interview.id,
            title: interview.role || "미분류",
            content: "",
            answer: "",
            recommendation: "",
            score: interview.totalScore || 0,
            desc: "score",
            date: new Date(interview.createdAt).toISOString().slice(0, 10).replace(/-/g, '.'),
            type: "일반",
            more: true,
            recommend: 0,
            views: 0,
            feedback: interview.summary || `${interview.role} 포지션에 대한 답변입니다.`,
            bookmarked: interview.bookmarked || false,
            isDeleted: false,
            career: interview.role || "미분류",
            
            // 추가 인터뷰 정보
            totalScore: interview.totalScore || 0, 
            personalityScore: interview.personalityScore || 0,
            jobScore: interview.jobScore || 0,
            summary: interview.summary || "",
            strengths: interview.strengths || "",
            improvements: interview.improvements || "",
            
            // 질문 목록
            questions: interview.questions || [],
            
            // 원본 인터뷰 데이터
            interviewData: interview
          };
        }
        
        // 면접과 질문 데이터를 결합하여 반환
        return {
          id: index + 1,
          originalId: interview.id, // 면접 ID를 원본 ID로 사용
          interviewId: interview.id,
          title: interview.role || "미분류",
          content: firstQuestion.content || "",
          answer: firstQuestion.myAnswer || "",
          recommendation: firstQuestion.recommended || "",
          score: interview.totalScore || 0,
          desc: "score",
          date: new Date(interview.createdAt).toISOString().slice(0, 10).replace(/-/g, '.'),
          type: firstQuestion.type === "PERSONALITY" ? "인성" : "직무",
          more: true,
          recommend: 0,
          views: 0,
          feedback: interview.summary || `${interview.role} 포지션에 대한 답변입니다.`,
          bookmarked: interview.bookmarked || false,
          isDeleted: false,
          career: interview.role || "미분류",
          
          // 추가 인터뷰 정보
          totalScore: interview.totalScore || 0, 
          personalityScore: interview.personalityScore || 0,
          jobScore: interview.jobScore || 0,
          summary: interview.summary || "",
          strengths: interview.strengths || "",
          improvements: interview.improvements || "",
          
          // 질문 목록
          questions: interview.questions || [],
          
          // 원본 인터뷰 데이터
          interviewData: interview
        };
      });
      
      console.log(`[DEBUG] 변환된 데이터:`, formattedData);
      
      // 숨겨진 항목 필터링
      const filteredData = formattedData.filter(item => !hiddenQuestions.includes(item.originalId));
      console.log(`[DEBUG] 필터링 후 데이터:`, filteredData);
      console.log(`[DEBUG] 필터링으로 제외된 항목 수: ${formattedData.length - filteredData.length}`);
      
      // 데이터가 더 없으면 hasMore를 false로 설정
      const hasMoreData = filteredData.length > 0 && filteredData.length >= SCROLL_BATCH_SIZE;
      console.log(`[DEBUG] 더 로드할 데이터 있음: ${hasMoreData}`);
      
      // 정렬 (필터 타입에 따라 다르게 적용)
      let sortedResults;
      if (sortType === SORT_OPTIONS.LATEST) {
        // 최신순: 북마크 상태와 무관하게 날짜순으로만 정렬
        sortedResults = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortType === SORT_OPTIONS.BOOKMARK) {
        // 북마크순: 북마크된 항목이 상단에 오도록 정렬
        sortedResults = filteredData.sort((a, b) => {
          // 북마크 상태가 다르면 북마크된 것이 먼저 오도록
          if (a.bookmarked !== b.bookmarked) {
            return a.bookmarked ? -1 : 1;
          }
          // 북마크 상태가 같으면 날짜순 정렬
          return new Date(b.date) - new Date(a.date);
        });
      } else {
        // 기본값: 날짜순 정렬
        sortedResults = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      console.log(`[DEBUG] 정렬 후 결과:`, sortedResults);
      
      // 중복 데이터 감지 (originalId 기준)
      let isDuplicate = false;
      if (page > 0 && state.results.length > 0) {
        // API 응답의 모든 항목이 이미 있는지 확인
        const existingIds = state.results.map(item => item.originalId);
        const newIds = sortedResults.map(item => item.originalId);
        
        // 모든 새 ID가 기존 ID 목록에 있는지 확인
        const allDuplicated = newIds.every(id => existingIds.includes(id));
        
        // 새 항목이 없으면 중복으로 처리
        if (allDuplicated) {
          console.log(`[DEBUG] 중복 데이터 감지됨. 더 이상 로드하지 않음.`);
          isDuplicate = true;
        }
      }
      
      // 상태 업데이트 (첫 페이지와 스크롤 페이지)
      if (page === 0) {
        // 초기 로드 시에는 PAGE_SIZE 개수만큼 표시 (6개)
        dispatch({ type: ACTIONS.SET_RESULTS, payload: sortedResults });
        // 초기 페이지에는 PAGE_SIZE 개수만 표시
        dispatch({ type: ACTIONS.SET_VISIBLE_RESULTS, payload: sortedResults.slice(0, PAGE_SIZE) });
        console.log(`[DEBUG] 초기 페이지 상태 업데이트 - 표시 항목 수: ${sortedResults.slice(0, PAGE_SIZE).length}`);
        
        // 더 로드할 데이터가 있는지 여부 (API 응답 확인)
        // 초기에 불러온 데이터가 더 있으면 hasMore = true
        const hasMoreItems = sortedResults.length > PAGE_SIZE || data.length >= PAGE_SIZE;
        console.log(`[DEBUG] hasMore 상태 계산: 총 항목 ${sortedResults.length}개, 표시 항목 ${PAGE_SIZE}개, API 응답 ${data.length}개, hasMore=${hasMoreItems}`);
        dispatch({ type: ACTIONS.SET_HAS_MORE, payload: hasMoreItems });
      } else {
        // 스크롤 시 추가 데이터 로드
        
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
        const visibleItems = uniqueResults.slice(0, Math.floor(PAGE_SIZE / 2) + (page * SCROLL_BATCH_SIZE));
        dispatch({ 
          type: ACTIONS.SET_VISIBLE_RESULTS, 
          payload: visibleItems
        });
        console.log(`[DEBUG] 추가 페이지 상태 업데이트 - 총 항목 수: ${uniqueResults.length}, 표시 항목 수: ${visibleItems.length}`);
        
        // 더 로드할 데이터가 있는지 여부 (API 응답 확인)
        // 1. 중복 감지되었거나
        // 2. API 응답이 SCROLL_BATCH_SIZE보다 작거나
        // 3. 정렬된 결과가 없으면 hasMore = false
        const hasMoreItems = !isDuplicate && data.length >= SCROLL_BATCH_SIZE && sortedResults.length > 0;
        console.log(`[DEBUG] hasMore 상태 계산 (추가 페이지): 중복=${isDuplicate}, API 응답 ${data.length}개, SCROLL_BATCH_SIZE=${SCROLL_BATCH_SIZE}, hasMore=${hasMoreItems}`);
        dispatch({ type: ACTIONS.SET_HAS_MORE, payload: hasMoreItems });
      }
      
      dispatch({ type: ACTIONS.SET_PAGE, payload: page });
      dispatch({ type: ACTIONS.SET_TOTAL_COUNT, payload: total });
      console.log(`[DEBUG] 데이터 로드 완료 - 페이지: ${page}, 정렬: ${sortType}`);
    } catch (error) {
      console.error(`[DEBUG] 데이터 로드 오류:`, error);
      // 상세 오류 메시지 출력
      if (error.response) {
        // 서버가 응답을 반환했지만 2xx 범위가 아닌 상태 코드
        console.error(`[DEBUG] 서버 오류 응답:`, error.response);
        dispatch({ type: ACTIONS.SET_ERROR, payload: `서버 오류: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}` });
      } else if (error.request) {
        // 요청이 발생했지만 응답을 받지 못함
        console.error(`[DEBUG] 서버 무응답:`, error.request);
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
    
    const targetItem = state.results.find(q => q.id === id);
    if (!targetItem) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return Promise.reject(new Error("북마크할 항목을 찾을 수 없습니다."));
    }
    
    const originalId = targetItem.originalId; // 면접 ID
    const newBookmarkState = !targetItem.bookmarked;
    
    // 상태 낙관적 업데이트
    const updatedResults = state.results.map(q => 
      q.id === id ? { ...q, bookmarked: newBookmarkState } : q
    );
    
    // visibleResults도 함께 업데이트하여 UI에 즉시 반영
    const updatedVisibleResults = state.visibleResults.map(q => 
      q.id === id ? { ...q, bookmarked: newBookmarkState } : q
    );
    
    dispatch({ type: ACTIONS.SET_RESULTS, payload: updatedResults });
    dispatch({ 
      type: ACTIONS.SET_VISIBLE_RESULTS, 
      payload: updatedVisibleResults
    });
    
    try {
      // 면접 북마크 API 호출
      await toggleInterviewBookmark(originalId, newBookmarkState);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return Promise.resolve({ success: true, bookmarked: newBookmarkState });
    } catch (error) {
      // 오류 발생 시 상태 롤백
      dispatch({ type: ACTIONS.SET_RESULTS, payload: state.results });
      dispatch({ 
        type: ACTIONS.SET_VISIBLE_RESULTS, 
        payload: state.visibleResults
      });
      
      dispatch({ type: ACTIONS.SET_ERROR, payload: "북마크 업데이트 중 오류가 발생했습니다." });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return Promise.reject(error);
    }
  }, [state.results, state.page, state.visibleResults]);
  
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
      
      // 선택된 항목들의 originalId(면접 ID) 배열 생성
      const interviewIdsToDelete = [];
      
      for (const id of itemsToDelete) {
        const item = state.results.find(q => q.id === id);
        if (item && item.interviewId) {
          interviewIdsToDelete.push(item.interviewId);
        }
      }
      
      console.log('[DEBUG] 삭제할 면접 ID 목록:', interviewIdsToDelete);
      
      if (interviewIdsToDelete.length > 0) {
        // 서버에 배치 삭제 요청
        try {
          const result = await batchDeleteInterviews(interviewIdsToDelete);
          console.log('[DEBUG] 배치 삭제 결과:', result);
        } catch (error) {
          console.error('[ERROR] 면접 배치 삭제 실패:', error);
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
      console.error('[ERROR] 항목 삭제 중 오류:', error);
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