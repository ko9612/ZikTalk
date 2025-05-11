import { useState, useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (loadMoreResults, hasMore, loading, setLoading) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [isActionDebouncing, setIsActionDebouncing] = useState(false);
  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading || !userScrolled) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && userScrolled && !isActionDebouncing) {
            if (setLoading) setLoading(true);
            setTimeout(() => {
              loadMoreResults();
            }, 1000);
          }
        },
        {
          root: null,
          rootMargin: "0px 0px 50px 0px",
          threshold: 0.5,
        }
      );

      if (node) observer.current.observe(node);
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
    let prevScrollY = window.scrollY;
    let scrolledDown = false;
    let scrollTimeout;

    const handleScroll = () => {
      if (isActionDebouncing) return; // 액션 디바운싱 중이면 스크롤 이벤트 무시
      
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
          if (setLoading) setLoading(true);
          setTimeout(() => {
            loadMoreResults();
          });
        }
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [loading, hasMore, userScrolled, setLoading, isActionDebouncing]);

  return { lastElementRef, userScrolled, setUserScrolled, debounceScrollAction };
}; 