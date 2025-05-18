import { useReducer, useCallback, useEffect } from "react";
import { ACTIONS, PAGE_SIZE, SCROLL_BATCH_SIZE } from "./constants";
import { SORT_OPTIONS } from "@/components/common/useFilter";
import {
  fetchInterviewsWithFirstQuestion,
  toggleInterviewBookmark,
  batchDeleteInterviews,
} from "@/api/myPageApi";
import { loginInfo } from "@/store/loginStore";

// 초기 상태
const initialState = {
  results: [], // 전체 결과 (필터링 전)
  page: 0,
  visibleResults: [], // 화면에 표시할 결과
  hasMore: true,
  loading: false,
  selected: {},
  isDeleteMode: false,
  totalCount: 0,
  error: null,
  currentSortType: "최신순", // 현재 정렬 타입 저장
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
          [action.payload]: !state.selected[action.payload],
        },
      };
    case ACTIONS.TOGGLE_DELETE_MODE:
      return { ...state, isDeleteMode: !state.isDeleteMode };
    case ACTIONS.CLEAR_SELECTED:
      return { ...state, selected: {} };
    case ACTIONS.SET_SORT_TYPE:
      return { ...state, currentSortType: action.payload };
    case ACTIONS.RESET_STATE:
      return {
        ...state,
        results: [],
        visibleResults: [],
        page: 0,
        hasMore: true,
        error: null,
      };
    default:
      return state;
  }
}

/**
 * 질문 목록 상태 관리 훅 (common 훅 활용 버전)
 */
export function useQuestionListState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const userId = loginInfo(state => state.userId);

  // 질문 데이터 불러오기
  const fetchQuestionsData = useCallback(
    async (page = 0, sortType = SORT_OPTIONS.LATEST, userId = null) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        // 정렬 타입이 변경되었을 때 처리
        const isFilterChange = sortType !== state.currentSortType;
        const isBookmarkToLatest =
          state.currentSortType === SORT_OPTIONS.BOOKMARK &&
          sortType === SORT_OPTIONS.LATEST;

        if (isFilterChange) {
          // 정렬 타입 변경 (상태 초기화하지 않음)
          dispatch({ type: ACTIONS.SET_SORT_TYPE, payload: sortType });
          page = 0; // 페이지 번호 초기화
        } else {
          // 정렬 타입 저장
          dispatch({ type: ACTIONS.SET_SORT_TYPE, payload: sortType });
        }

        // API 파라미터 설정
        const isBookmarked = false; // 북마크 필터링을 API에서 하지 않고 클라이언트에서 정렬만 수행
        const sortBy = "date"; // 항상 날짜순 요청
        const isInitialLoad = page === 0;

        // 초기 로드 시 더 많은 데이터 불러오기
        const batchSize =
          page === 0
            ? SCROLL_BATCH_SIZE * 5 // 초기 로드 시 더 많은 데이터 로드
            : SCROLL_BATCH_SIZE;

        // API 호출 - userId 전달
        const data = await fetchInterviewsWithFirstQuestion(
          page + 1,
          batchSize,
          sortBy,
          isBookmarked,
          isInitialLoad,
          userId
        );

        if (!data) throw new Error("데이터를 불러올 수 없습니다.");

        // 데이터 가공
        const formattedData = data.map((interview, index) => {
          const firstQuestion = interview.questions?.[0] || null;
          const uniqueId = `${interview.id}-${page}-${index}`;

          return {
            id: uniqueId,
            originalId: interview.id,
            interviewId: interview.id,
            title: interview.role || "미분류",
            content: firstQuestion?.content || "",
            answer: firstQuestion?.myAnswer || "",
            recommendation: firstQuestion?.recommended || "",
            score: interview.totalScore || 0,
            desc: "score",
            date: new Date(interview.createdAt)
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "."),
            createdAt: interview.createdAt, // 원본 타임스탬프 저장
            type: firstQuestion?.type === "PERSONALITY" ? "인성" : "직무",
            bookmarked: interview.bookmarked || false,
            interviewData: interview,
            userId: interview.userId || userId, // 사용자 ID 저장
            summary: interview.summary || "", // summary 필드 추가
          };
        });

        // 정렬 함수
        const sortResults = (results, type) => {
          if (type === SORT_OPTIONS.BOOKMARK) {
            // 북마크 우선 정렬
            return [...results].sort((a, b) => {
              if (a.bookmarked !== b.bookmarked) {
                return a.bookmarked ? -1 : 1;
              }
              return new Date(b.createdAt) - new Date(a.createdAt);
            });
          } else {
            // 최신순 정렬
            return [...results].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
          }
        };

        // 사용자 ID로 필터링 (받은 userId가 있는 경우)
        const filteredByUser = userId
          ? formattedData.filter(
              (item) => !item.userId || item.userId === userId,
            )
          : formattedData;

        // 데이터 정렬
        const sortedResults = sortResults(filteredByUser, sortType);
        const hasMoreData = data.length >= batchSize;

        if (page === 0) {
          // 첫 페이지 로드 - 결과 대체
          dispatch({ type: ACTIONS.SET_RESULTS, payload: sortedResults });

          // 필터 변경된 경우 - 모든 전환에서 부드러운 정렬 적용
          if (isFilterChange && state.results.length > 0) {
            // 기존 데이터를 새 정렬 타입으로 재정렬
            // sortResults 함수 재사용 (최신순일 때는 이미 날짜 기준으로만 정렬됨)
            const reorderedResults = sortResults(state.results, sortType);

            // 표시 항목 유지하면서 정렬만 변경
            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: reorderedResults.slice(0, state.visibleResults.length),
            });
          } else {
            // 첫 로드 시
            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: sortedResults.slice(0, SCROLL_BATCH_SIZE),
            });
          }
        } else {
          // 추가 페이지 로드 - 결과 병합
          // 중복 제거된 새 결과 배열 생성
          const uniqueResults = mergeUniqueResults(
            state.results,
            sortedResults,
          );

          // 정렬 적용
          const sortedMergedResults = sortResults(uniqueResults, sortType);

          dispatch({ type: ACTIONS.SET_RESULTS, payload: sortedMergedResults });

          // 스크롤 시 추가 표시할 항목 수 계산
          const visibleCount =
            state.visibleResults.length +
            Math.min(sortedResults.length, SCROLL_BATCH_SIZE);

          dispatch({
            type: ACTIONS.SET_VISIBLE_RESULTS,
            payload: sortedMergedResults.slice(0, visibleCount),
          });
        }

        dispatch({ type: ACTIONS.SET_HAS_MORE, payload: hasMoreData });
        dispatch({ type: ACTIONS.SET_PAGE, payload: page });
        dispatch({ type: ACTIONS.SET_TOTAL_COUNT, payload: data.length });
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: `데이터 로드 중 오류가 발생했습니다.`,
        });
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },
    [state.results, state.currentSortType, state.visibleResults.length],
  );

  // 북마크 토글 함수
  const toggleQuestionBookmark = useCallback(
    async (id, userId = null) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        // 항목 찾기
        const targetItem = state.results.find((q) => q.id === id);
        if (!targetItem) {
          throw new Error("북마크할 항목을 찾을 수 없습니다.");
        }

        const originalId = targetItem.originalId;
        const newBookmarkState = !targetItem.bookmarked;

        // API 호출 - userId 전달
        await toggleInterviewBookmark(originalId, newBookmarkState, userId);

        // 전체 결과 배열에서 북마크 상태 업데이트
        const updatedResults = state.results.map((item) =>
          item.originalId === originalId
            ? { ...item, bookmarked: newBookmarkState }
            : item,
        );

        dispatch({ type: ACTIONS.SET_RESULTS, payload: updatedResults });

        // 북마크 필터 모드일 때 특수 처리
        if (state.currentSortType === SORT_OPTIONS.BOOKMARK) {
          // 북마크 해제 시: 해당 항목 제거 후 재정렬
          if (!newBookmarkState) {
            // originalId가 일치하는 항목을 제외한 나머지만 표시
            const filteredVisible = state.visibleResults.filter(
              (item) => item.originalId !== originalId,
            );
            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: filteredVisible,
            });
          } else {
            // 북마크 추가 시: 전체 재정렬 (북마크된 항목이 앞으로 오도록)
            const sortedResults = [...updatedResults].sort((a, b) => {
              if (a.bookmarked !== b.bookmarked) {
                return a.bookmarked ? -1 : 1;
              }
              return new Date(b.createdAt) - new Date(a.createdAt);
            });

            // 현재 표시 중인 항목 수 유지
            const currentCount = state.visibleResults.length;
            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: sortedResults.slice(0, currentCount),
            });
          }
        } else {
          // 일반 모드에서는 표시 중인 항목들의 북마크 상태만 업데이트
          const updatedVisible = state.visibleResults.map((item) =>
            item.originalId === originalId
              ? { ...item, bookmarked: newBookmarkState }
              : item,
          );
          dispatch({
            type: ACTIONS.SET_VISIBLE_RESULTS,
            payload: updatedVisible,
          });
        }

        return { success: true, bookmarked: newBookmarkState, originalId };
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: "북마크 업데이트 실패" });
        return Promise.reject(error);
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    },
    [state.results, state.currentSortType, state.visibleResults],
  );

  // 항목 선택 토글
  const toggleSelectItem = useCallback((id) => {
    dispatch({ type: ACTIONS.TOGGLE_SELECT, payload: id });
  }, []);

  // 삭제 모드 토글
  const toggleDeleteMode = useCallback(() => {
    if (state.isDeleteMode) {
      dispatch({ type: ACTIONS.CLEAR_SELECTED });
    }
    dispatch({ type: ACTIONS.TOGGLE_DELETE_MODE });
  }, [state.isDeleteMode]);

  // 선택된 항목 삭제
  const markAsDeleted = useCallback(
    async (selectedItems, userId = null) => {
      try {
        const itemsToDelete = Object.keys(selectedItems).filter(
          (id) => selectedItems[id],
        );
        if (itemsToDelete.length === 0) return;

        // UI 업데이트
        const updatedResults = state.results.filter(
          (item) => !itemsToDelete.includes(item.id),
        );

        dispatch({ type: ACTIONS.SET_RESULTS, payload: updatedResults });
        dispatch({
          type: ACTIONS.SET_VISIBLE_RESULTS,
          payload: updatedResults,
        });

        dispatch({ type: ACTIONS.CLEAR_SELECTED });
        dispatch({ type: ACTIONS.TOGGLE_DELETE_MODE });

        // 서버 업데이트
        const interviewIds = itemsToDelete
          .map((id) => state.results.find((q) => q.id === id)?.interviewId)
          .filter((id) => id);

        if (interviewIds.length > 0) {
          await batchDeleteInterviews(interviewIds, userId);
        }
      } catch (error) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: "삭제 중 오류가 발생했습니다.",
        });
      }
    },
    [state.results],
  );

  // 중복 없이 결과 병합 (개선된 버전)
  function mergeUniqueResults(existingResults, newResults) {
    // ID 기반 맵 생성
    const resultMap = new Map();

    // 기존 결과 추가
    existingResults.forEach((item) => {
      resultMap.set(item.originalId, item);
    });

    // 새 결과 추가 (중복 시 북마크 상태 유지)
    newResults.forEach((item) => {
      const existing = resultMap.get(item.originalId);
      if (existing) {
        // 기존 항목의 북마크 상태 유지하면서 업데이트
        resultMap.set(item.originalId, {
          ...item,
          bookmarked: existing.bookmarked,
        });
      } else {
        resultMap.set(item.originalId, item);
      }
    });

    // 맵을 배열로 변환
    return Array.from(resultMap.values());
  }

  return {
    state,
    fetchQuestions: fetchQuestionsData,
    toggleQuestionBookmark,
    setLoading: useCallback((isLoading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading });
    }, []),
    toggleSelectItem,
    toggleDeleteMode,
    markAsDeleted,
  };
}
