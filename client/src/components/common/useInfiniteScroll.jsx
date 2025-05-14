import { useState, useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (loadMoreResults, hasMore, loading, setLoading) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [isActionDebouncing, setIsActionDebouncing] = useState(false);
  const observer = useRef();
  const prevDataRef = useRef([]);

  // 디버깅: 상태 변경 시 로깅
  useEffect(() => {
    console.log(`[DEBUG] InfiniteScroll 상태 변경: hasMore=${hasMore}, loading=${loading}, userScrolled=${userScrolled}`);
  }, [hasMore, loading, userScrolled]);

  const lastElementRef = useCallback(
    (node) => {
      // hasMore가 false면 더 이상 관찰하지 않음
      if (loading || !userScrolled || !hasMore) {
        console.log('[DEBUG] InfiniteScroll: 관찰 중단 - 로딩 중이거나 스크롤 안했거나 더 이상 데이터 없음');
        return;
      }

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && userScrolled && !isActionDebouncing) {
            console.log('[DEBUG] InfiniteScroll: 마지막 요소 감지됨, 추가 데이터 로드 시작');
            if (setLoading) setLoading(true);
            setTimeout(() => {
              loadMoreResults();
            }, 1000);
          }
        },
        {
          root: null,
          rootMargin: "0px 0px 100px 0px",
          threshold: 0.1,
        }
      );

      if (node) {
        console.log('[DEBUG] InfiniteScroll: 새 마지막 요소 관찰 시작');
        observer.current.observe(node);
      }
    },
    [loading, hasMore, userScrolled, setLoading, isActionDebouncing]
  );

  // 액션 후 일시적으로 스크롤 이벤트를 무시하는 함수
  const debounceScrollAction = useCallback(() => {
    setIsActionDebouncing(true);
    setTimeout(() => {
      setIsActionDebouncing(false);
    }, 500);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 0 && !userScrolled) {
        setUserScrolled(true);
      }
    };
    const handleTouchMove = (e) => {
      if (!userScrolled) {
        setUserScrolled(true);
      }
    };
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [userScrolled]);

  useEffect(() => {
    // hasMore가 false면 스크롤 이벤트를 등록하지 않음
    if (!hasMore) {
      console.log('[DEBUG] InfiniteScroll: 더 이상 데이터가 없어 스크롤 이벤트 등록하지 않음');
      return;
    }

    let prevScrollY = window.scrollY;
    let scrolledDown = false;
    let scrollTimeout;

    const handleScroll = () => {
      if (isActionDebouncing) return; // 액션 디바운싱 중이면 스크롤 이벤트 무시
      if (!hasMore) return; // 더 이상 데이터가 없으면 스크롤 이벤트 무시
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        scrolledDown = currentScrollY > prevScrollY;
        prevScrollY = currentScrollY;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 200;

        if (
          scrolledDown &&
          scrollPosition >= threshold &&
          !loading &&
          hasMore
        ) {
          console.log('[DEBUG] InfiniteScroll: 스크롤 하단 감지, 추가 데이터 로드 시작');
          if (setLoading) setLoading(true);
          setTimeout(() => {
            loadMoreResults();
          }, 200); // 더 짧은 시간으로 조정
        }
      }, 100);
    };

    console.log('[DEBUG] InfiniteScroll: 스크롤 이벤트 리스너 등록');
    window.addEventListener("scroll", handleScroll);
    return () => {
      console.log('[DEBUG] InfiniteScroll: 스크롤 이벤트 리스너 제거');
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [loading, hasMore, userScrolled, setLoading, isActionDebouncing, loadMoreResults]);

  return { lastElementRef, userScrolled, setUserScrolled, debounceScrollAction };
}; 