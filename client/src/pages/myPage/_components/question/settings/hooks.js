import { useReducer, useCallback } from "react";
import { ACTIONS, SCROLL_BATCH_SIZE } from "./constants";
import { SORT_OPTIONS } from "@/hooks/useFilter";
import {
  fetchInterviewsWithFirstQuestion,
  toggleInterviewBookmark,
  batchDeleteInterviews,
} from "@/api/myPageApi";

const initialState = {
  results: [],
  page: 0,
  visibleResults: [],
  hasMore: true,
  loading: false,
  selected: {},
  isDeleteMode: false,
  totalCount: 0,
  error: null,
  currentSortType: "최신순",
};

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

export function useQuestionListState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchQuestionsData = useCallback(
    async (page = 0, sortType = SORT_OPTIONS.LATEST) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        const isFilterChange = sortType !== state.currentSortType;
        const isBookmarkToLatest =
          state.currentSortType === SORT_OPTIONS.BOOKMARK &&
          sortType === SORT_OPTIONS.LATEST;

        if (isFilterChange) {
          dispatch({ type: ACTIONS.SET_SORT_TYPE, payload: sortType });
          if (page !== 0) {
            page = 0;
          }
        } else {
          dispatch({ type: ACTIONS.SET_SORT_TYPE, payload: sortType });
        }

        const sortBy = "date";
        const isInitialLoad = page === 0;
        const batchSize = page === 0 ? SCROLL_BATCH_SIZE * 1 : SCROLL_BATCH_SIZE;

        const data = await fetchInterviewsWithFirstQuestion(
          page + 1,
          batchSize,
          sortBy,
          undefined,
          isInitialLoad,
        );

        if (!data) throw new Error("데이터를 불러올 수 없습니다.");

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
            createdAt: interview.createdAt,
            type: firstQuestion?.type === "PERSONALITY" ? "인성" : "직무",
            bookmarked: interview.bookmarked || false,
            interviewData: interview,
            summary: interview.summary || "",
          };
        });

        const sortResults = (results, type) => {
          if (type === SORT_OPTIONS.BOOKMARK) {
            return [...results].sort((a, b) => {
              if (a.bookmarked !== b.bookmarked) {
                return a.bookmarked ? -1 : 1;
              }
              return new Date(b.createdAt) - new Date(a.createdAt);
            });
          } else {
            return [...results].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
          }
        };

        const filteredByUser = formattedData;
        const filteredByBookmark = filteredByUser;
        const sortedResults = sortResults(filteredByBookmark, sortType);
        const hasMoreData = data.length >= batchSize;
        const adjustedHasMore = isFilterChange || hasMoreData;

        if (page === 0) {
          dispatch({ type: ACTIONS.SET_RESULTS, payload: sortedResults });

          if (isFilterChange && state.results.length > 0) {
            const reorderedResults = sortResults(state.results, sortType);
            const visibleCount = Math.max(
              state.visibleResults.length,
              SCROLL_BATCH_SIZE,
            );

            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: reorderedResults.slice(0, visibleCount),
            });
          } else {
            const initialVisibleCount = Math.min(
              sortedResults.length,
              SCROLL_BATCH_SIZE,
            );

            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: sortedResults.slice(0, initialVisibleCount),
            });
          }
        } else {
          const uniqueResults = mergeUniqueResults(
            state.results,
            sortedResults,
          );

          const sortedMergedResults = sortResults(uniqueResults, sortType);

          dispatch({ type: ACTIONS.SET_RESULTS, payload: sortedMergedResults });

          const visibleCount = (page + 1) * SCROLL_BATCH_SIZE;

          dispatch({
            type: ACTIONS.SET_VISIBLE_RESULTS,
            payload: sortedMergedResults.slice(0, visibleCount),
          });
        }

        dispatch({ type: ACTIONS.SET_HAS_MORE, payload: adjustedHasMore });
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

  const toggleQuestionBookmark = useCallback(
    async (id) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        const targetItem = state.results.find((q) => q.id === id);
        if (!targetItem) {
          throw new Error("북마크할 항목을 찾을 수 없습니다.");
        }

        const originalId = targetItem.originalId;
        const newBookmarkState = !targetItem.bookmarked;

        await toggleInterviewBookmark(originalId, newBookmarkState);

        const updatedResults = state.results.map((item) =>
          item.originalId === originalId
            ? { ...item, bookmarked: newBookmarkState }
            : item,
        );

        dispatch({ type: ACTIONS.SET_RESULTS, payload: updatedResults });

        if (state.currentSortType === SORT_OPTIONS.BOOKMARK) {
          if (!newBookmarkState) {
            const filteredVisible = state.visibleResults.filter(
              (item) => item.originalId !== originalId,
            );
            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: filteredVisible,
            });
          } else {
            const sortedResults = [...updatedResults].sort((a, b) => {
              if (a.bookmarked !== b.bookmarked) {
                return a.bookmarked ? -1 : 1;
              }
              return new Date(b.createdAt) - new Date(a.createdAt);
            });

            const currentCount = state.visibleResults.length;
            dispatch({
              type: ACTIONS.SET_VISIBLE_RESULTS,
              payload: sortedResults.slice(0, currentCount),
            });
          }
        } else {
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

  const toggleSelectItem = useCallback((id) => {
    dispatch({ type: ACTIONS.TOGGLE_SELECT, payload: id });
  }, []);

  const toggleDeleteMode = useCallback(() => {
    if (state.isDeleteMode) {
      dispatch({ type: ACTIONS.CLEAR_SELECTED });
    }
    dispatch({ type: ACTIONS.TOGGLE_DELETE_MODE });
  }, [state.isDeleteMode]);

  const markAsDeleted = useCallback(
    async (selectedItems) => {
      try {
        const itemsToDelete = Object.keys(selectedItems).filter(
          (id) => selectedItems[id],
        );
        if (itemsToDelete.length === 0) return;

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

        const interviewIds = itemsToDelete
          .map((id) => state.results.find((q) => q.id === id)?.interviewId)
          .filter((id) => id);

        if (interviewIds.length > 0) {
          await batchDeleteInterviews(interviewIds);
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

  function mergeUniqueResults(existingResults, newResults) {
    const resultMap = new Map();

    existingResults.forEach((item) => {
      resultMap.set(item.originalId, item);
    });

    newResults.forEach((item) => {
      const existing = resultMap.get(item.originalId);
      if (existing) {
        resultMap.set(item.originalId, {
          ...item,
          bookmarked: existing.bookmarked,
        });
      } else {
        resultMap.set(item.originalId, item);
      }
    });

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
