import { useState, useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (loadMoreResults, hasMore, loading, setLoading, delayTime = 400) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [isActionDebouncing, setIsActionDebouncing] = useState(false);
  const [isShowingLoadingAnimation, setIsShowingLoadingAnimation] = useState(false);
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
    hasForceScrollCheck: false
  });
  
  // 데이터 로드 함수 - 로딩 모션을 보여주고 데이터를 불러옴
  const loadData = useCallback(async (source = "미확인") => {
    // 마지막 로드 시간 확인
    const now = Date.now();
    const timeSinceLastLoad = now - debugRef.current.lastLoadTime;
    
    // 너무 빠른 재요청 방지 시간을 1초로 유지
    if (timeSinceLastLoad < 1000) {
      console.log(`[스크롤] 최근 로드 후 ${timeSinceLastLoad}ms - 너무 빠른 재요청 방지`);
      return;
    }
    
    // 로드 락 확인 (맨 아래에 도달한 경우 예외 처리 추가)
    if (isLoadLocked) {
      // 현재 스크롤 위치 확인
      const scrollPosition = window.innerHeight + window.scrollY;
      const scrollHeight = document.body.scrollHeight;
      const isAtVeryBottom = scrollHeight - scrollPosition < 50; // 완전 맨 아래 50px 이내
      
      // 완전 맨 아래라면 락을 무시하고 진행
      if (!isAtVeryBottom) {
        console.log('[스크롤] 로드 락 활성화 - 데이터 로드 차단');
        return;
      } else {
        console.log('[스크롤] 맨 아래 감지 - 로드 락 무시');
      }
    }
    
    // 로딩 중이거나 더 로드할 데이터가 없으면 중단
    if (loading || !hasMore || !userScrolled) {
      console.log('[스크롤] 로드 중단:', { loading, hasMore, userScrolled });
      return;
    }
    
    try {
      // 로드 락 설정
      setIsLoadLocked(true);
      debugRef.current.lastLoadTime = now;
      console.log('[스크롤] 로딩 애니메이션 표시 시작');
      
      // 로딩 상태 먼저 설정 - 애니메이션 보여줌
      setIsShowingLoadingAnimation(true);
      if (setLoading) setLoading(true);
      
      // 약간의 지연 - 로딩 애니메이션이 보이도록
      await new Promise(resolve => setTimeout(resolve, delayTime));
      
      // 실제 데이터 로드 함수 호출
      console.log('[스크롤] 데이터 로드 시작');
      await loadMoreResults();
    } catch (error) {
      console.error('[스크롤] 데이터 로드 오류:', error);
    } finally {
      // 로딩 완료 후 상태 초기화
      console.log('[스크롤] 로딩 완료, 애니메이션 숨김');
      
      if (setLoading) setLoading(false);
      setIsShowingLoadingAnimation(false);
      
      // 추가 지연 후 락 해제 (500ms 유지)
      setTimeout(() => {
        setIsLoadLocked(false);
        console.log('[스크롤] 로드 락 해제');
        
        // 락 해제 후 현재 위치 체크하여 추가 로드 필요한지 확인
        checkScrollPositionForLoad('lockReleased');
      }, 500);
    }
  }, [loadMoreResults, hasMore, loading, setLoading, userScrolled, isLoadLocked, delayTime]);
  
  // 스크롤 위치 체크하여 필요시 로드 시작
  const checkScrollPositionForLoad = useCallback((source = "위치체크") => {
    // 기본 조건 확인
    if (loading || isActionDebouncing || !userScrolled || isShowingLoadingAnimation || isLoadLocked) {
      return false;
    }

    // hasMore 조건을 처음에 확인하지 않음 (필터 변경 후 즉시 확인을 위해)
    
    // 스크롤 위치 확인
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollHeight = document.body.scrollHeight;
    const threshold = scrollHeight - 500; // 임계값 늘림 (200px -> 500px)
    
    // 맨 아래 근처면 추가 로드
    if (scrollPosition >= threshold) {
      // 이제 hasMore 조건 확인
      if (!hasMore) {
        console.log(`[스크롤] ${source}에서 위치 확인 - 더 불러올 데이터 없음`);
        return false;
      }
      
      console.log(`[스크롤] ${source}에서 위치 확인 - 추가 로드 필요`);
      loadData(source);
      return true;
    }
    
    return false;
  }, [loading, isActionDebouncing, userScrolled, isShowingLoadingAnimation, isLoadLocked, hasMore, loadData]);
  
  // 관찰자 콜백 함수 - 엘리먼트가 화면에 나타날 때 호출
  const observerCallback = useCallback(entries => {
    const [entry] = entries;
    
    if (entry?.isIntersecting && !loading && hasMore && userScrolled && !isActionDebouncing && !isLoadLocked) {
      console.log('[스크롤] 마지막 요소 관찰 감지');
      loadData('observer');
    }
  }, [loading, hasMore, userScrolled, isActionDebouncing, isLoadLocked, loadData]);
  
  // 관찰자 초기화 - 의존성 배열에서 hasMore 제거하여 재생성 최소화
  useEffect(() => {
    // 기존 옵저버 정리
    if (observer.current) {
      observer.current.disconnect();
    }
    
    const currentObserver = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px 0px 2000px 0px", // 2000px 유지
      threshold: 0.1
    });
    
    observer.current = currentObserver;
    
    // 마지막 요소가 있다면 즉시 관찰 시작
    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }
    
    console.log('[스크롤-디버그] 새 Observer 생성됨');
    
    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
        console.log('[스크롤-디버그] Observer 제거됨');
      }
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [observerCallback]);
  
  // 마지막 요소 관찰 설정
  const lastElementRefCallback = useCallback(node => {
    if (!node) {
      lastElementRef.current = null;
      console.log('[스크롤-디버그] 마지막 요소 null, 관찰 중지');
      return;
    }
    
    // 새 노드 관찰 시작
    lastElementRef.current = node;
    
    // 옵저버가 이미 존재하면 바로 관찰 시작
    if (observer.current) {
      // 관찰 중인 모든 요소 해제
      observer.current.disconnect();
      // 새 요소만 관찰
      observer.current.observe(node);
      console.log('[스크롤] 새 마지막 요소 관찰 시작');
    }
  }, []);
  
  // 스크롤 감지
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 0 && !userScrolled) {
        console.log('[스크롤] 첫 스크롤 감지');
        setUserScrolled(true);
      }
    };
    
    const handleTouchMove = () => {
      if (!userScrolled) {
        console.log('[스크롤] 첫 터치 이동 감지');
        setUserScrolled(true);
      }
    };
    
    // 스크롤 중지 감지 함수
    const detectScrollEnd = () => {
      // 이전 타이머 취소
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      
      // 스크롤 중지 감지를 위한 타이머 설정 (100ms)
      scrollEndTimerRef.current = setTimeout(() => {
        console.log('[스크롤] 스크롤 중지 감지');
        
        // hasMore가 false라도 스크롤 후 처음 한 번은 확인해봄
        if (!hasMore && !debugRef.current.hasForceScrollCheck) {
          debugRef.current.hasForceScrollCheck = true;
          console.log('[스크롤] hasMore=false이지만 필터 변경 후 첫 체크 강제 수행');
          checkScrollPositionForLoad('forceCheck');
        } else {
          checkScrollPositionForLoad('scrollEnd');
        }
      }, 100);
    };
    
    // 스크롤 이벤트 (하단 감지용)
    const handleScroll = () => {
      // 스크롤 중지 감지
      detectScrollEnd();
      
      // 기본 조건 확인 (hasMore 제외 - 필터 변경 직후 강제 체크를 위해)
      if (loading || isActionDebouncing || !userScrolled || isShowingLoadingAnimation || isLoadLocked) return;
      
      const scrollPosition = window.innerHeight + window.scrollY;
      const scrollHeight = document.body.scrollHeight;
      const threshold = scrollHeight - 500; // 임계값 늘림 (200px -> 500px)
      
      if (scrollPosition >= threshold) {
        // 여기서 hasMore 확인
        if (!hasMore && !debugRef.current.hasForceScrollCheck) {
          debugRef.current.hasForceScrollCheck = true;
          console.log('[스크롤] hasMore=false이지만 필터 변경 후 첫 체크 강제 수행');
        } else if (!hasMore) {
          return;
        }
        
        console.log('[스크롤] 스크롤 하단 감지');
        loadData('scroll');
      }
    };
    
    // 스로틀링된 스크롤 이벤트 핸들러
    const throttledScrollHandler = () => {
      const now = Date.now();
      if (now - debugRef.current.lastScrollTime < 200) return;
      
      debugRef.current.lastScrollTime = now;
      handleScroll();
    };
    
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", throttledScrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", throttledScrollHandler);
      
      // 스크롤 종료 타이머 정리
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [hasMore, loading, isActionDebouncing, userScrolled, isShowingLoadingAnimation, isLoadLocked, loadData, checkScrollPositionForLoad]);
  
  // 디바운스 액션 - 필터 변경 후 스크롤 이벤트 일시 차단
  const debounceScrollAction = useCallback(() => {
    console.log('[스크롤-디버그] 디바운스 액션 시작 - 스크롤 이벤트 차단');
    setIsActionDebouncing(true);
    
    if (timerRef.current) {
      console.log('[스크롤-디버그] 이전 디바운스 타이머 취소');
      clearTimeout(timerRef.current);
    }
    
    // 필터 변경 시 강제 확인 플래그 초기화
    debugRef.current.hasForceScrollCheck = false;
    
    timerRef.current = setTimeout(() => {
      console.log('[스크롤-디버그] 디바운스 액션 종료 - 스크롤 이벤트 다시 허용');
      setIsActionDebouncing(false);
      
      // 디바운스 종료 후 위치 체크
      setTimeout(() => {
        checkScrollPositionForLoad('debounceEnd');
      }, 100);
    }, 500); // 디바운스 시간 증가 (400ms -> 500ms)
  }, [checkScrollPositionForLoad]);
  
  // 모든 상태 리셋 함수 강화
  const resetAllStates = useCallback(() => {
    console.log('[스크롤-디버그] 모든 상태 강제 리셋');
    
    // 진행 중인 타이머 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = null;
    }
    
    // 필터 변경 시 강제 확인 플래그 초기화
    debugRef.current.hasForceScrollCheck = false;
    
    // 모든 상태 초기화
    setIsShowingLoadingAnimation(false);
    setIsActionDebouncing(false);
    setIsLoadLocked(false);
    setUserScrolled(true); // 스크롤 상태를 true로 강제 설정
    
    if (setLoading) setLoading(false);
    
    // 리셋 후 위치 확인
    setTimeout(() => {
      // 스크롤 상태 다시 확인하고 필요하면 수동 활성화
      setUserScrolled(true);
      checkScrollPositionForLoad('reset');
    }, 200);
  }, [setLoading, checkScrollPositionForLoad]);

  return {
    lastElementRef: lastElementRefCallback,
    userScrolled,
    setUserScrolled,
    debounceScrollAction,
    isDelaying: isShowingLoadingAnimation,
    resetAllStates: resetAllStates
  };
};