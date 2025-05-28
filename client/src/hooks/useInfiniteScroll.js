import { useState, useEffect, useRef, useCallback } from "react";

export const useInfiniteScroll = (
  loadMoreResults,
  hasMore,
  loading,
  setLoading,
  delayTime = 10,
) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [isActionDebouncing, setIsActionDebouncing] = useState(false);
  const [isShowingLoadingAnimation, setIsShowingLoadingAnimation] =
    useState(false);
  const [isLoadLocked, setIsLoadLocked] = useState(false);

  const observer = useRef(null);
  const lastElementRef = useRef(null);
  const timerRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const debugRef = useRef({
    lastScrollTime: 0,
    scrollCount: 0,
    observerCount: 0,
    loadAttempts: 0,
    lastLoadTime: 0,
    hasForceScrollCheck: false,
  });

  const observerCallback = useCallback(
    (entries) => {
      const [entry] = entries;

      if (
        entry?.isIntersecting &&
        !loading &&
        hasMore &&
        userScrolled &&
        !isActionDebouncing &&
        !isLoadLocked
      ) {
        loadData("observer");
      }
    },
    [
      loading,
      hasMore,
      userScrolled,
      isActionDebouncing,
      isLoadLocked,
      loadData,
    ],
  );

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    const currentObserver = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px 0px 2000px 0px",
      threshold: 0.1,
    });

    observer.current = currentObserver;

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [observerCallback]);

  const loadData = useCallback(
    async (source = "manual") => {
      if (loading || !hasMore || isLoadLocked) return;

      setLoading(true);
      setIsLoadLocked(true);

      try {
        await loadMoreResults();
      } catch (error) {
        console.error("Error loading more results:", error);
      } finally {
        setLoading(false);
        setIsLoadLocked(false);
      }
    },
    [loading, hasMore, isLoadLocked, loadMoreResults]
  );

  const debounceScrollAction = useCallback(() => {
    if (isActionDebouncing) return;

    setIsActionDebouncing(true);
    setUserScrolled(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsActionDebouncing(false);
    }, delayTime);
  }, [isActionDebouncing, delayTime]);

  const resetAllStates = useCallback(() => {
    setUserScrolled(false);
    setIsActionDebouncing(false);
    setIsShowingLoadingAnimation(false);
    setIsLoadLocked(false);
  }, []);

  const lastElementRefCallback = useCallback(
    (node) => {
      if (lastElementRef.current) {
        observer.current?.unobserve(lastElementRef.current);
      }

      lastElementRef.current = node;

      if (node) {
        observer.current?.observe(node);
      }
    },
    []
  );

  return {
    lastElementRef: lastElementRefCallback,
    userScrolled,
    setUserScrolled,
    debounceScrollAction,
    isDelaying: isShowingLoadingAnimation,
    resetAllStates,
  };
}; 