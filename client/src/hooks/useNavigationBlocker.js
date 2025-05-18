import { useEffect, useRef } from "react";

const useNavigationBlocker = ({ onCleanup = () => {}, enabled = true }) => {
  const isNavigating = useRef(false);
  const hasPushedInitialEntry = useRef(false);
  const skipNextPopState = useRef(false);

  const historyEntryCount = useRef(0);
  const SESSION_KEY = "nav_blocker_state";

  const showNavigationWarning = () =>
    window.confirm("변경사항이 저장되지 않습니다. 계속 이동하시겠습니까?");

  const handleBeforeUnload = (event) => {
    if (enabled) {
      event.preventDefault();
      event.returnValue = "페이지를 떠나려고 합니다. 정말로 떠나시겠습니까?";
      return event.returnValue;
    }
  };

  const saveState = (state) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("세션 스토리지 저장 실패:", e);
    }
  };

  const loadState = () => {
    try {
      const state = sessionStorage.getItem(SESSION_KEY);
      return state ? JSON.parse(state) : null;
    } catch (e) {
      console.error("세션 스토리지 로드 실패:", e);
      return null;
    }
  };

  const addHistoryEntry = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("_navBlock", Math.random()); // 중복 방지용 변경 쿼리

    window.history.pushState(
      { navBlockerId: Math.random(), count: historyEntryCount.current++ },
      "",
      url.toString(),
    );

    saveState({
      historyEntryCount: historyEntryCount.current,
      time: Date.now(),
      hasPushed: true,
    });

    hasPushedInitialEntry.current = true;
  };

  const handlePopState = (event) => {
    if (!enabled) return;

    // popstate 무시해야 하는 상황이면 return
    if (skipNextPopState.current) {
      skipNextPopState.current = false;
      return;
    }

    const confirmed = showNavigationWarning();

    if (confirmed) {
      // '확인' 클릭 → 사용자 원래 의도: 페이지 떠나기
      isNavigating.current = true;
      onCleanup();
      cleanupEventListeners();

      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (e) {}

      // pushstate 때문에 전전페이지가 실제 이전페이지
      window.history.go(-1);
    } else {
      // '취소' 클릭 → popstate 때문에 이미 한 칸 뒤로 간 상태 → 다시 앞으로 가야 함
      event.preventDefault();

      // 다음 popstate는 무시하게 설정
      skipNextPopState.current = true;
      // 1단계: 원래 위치로 되돌아감
      window.history.forward();

      // 2단계: 되돌아간 후 다시 더미 state 추가 (뒤로가기 버튼 유지 목적)
      // defer 해줘야 race condition 방지 가능
      //   setTimeout(() => {
      //     const url = new URL(window.location.href);
      //     url.searchParams.set("_navBlock", Math.random());

      //     window.history.pushState(
      //       {
      //         navBlockerId: Math.random(),
      //         count: historyEntryCount.current++,
      //       },
      //       "",
      //       url.toString(),
      //     );

      //     saveState({
      //       historyEntryCount: historyEntryCount.current,
      //       time: Date.now(),
      //       hasPushed: true,
      //     });

      //     hasPushedInitialEntry.current = true;
      //   }, 0);
    }
  };

  const preventNavigation = (event) => {
    const eTarget = event.target;
    const tagName = eTarget.tagName.toLowerCase();
    const type = eTarget.getAttribute("type");
    const isFormControl =
      tagName === "select" ||
      tagName === "textarea" ||
      (tagName === "input" &&
        ["submit", "radio", "checkbox", "text"].includes(type));

    if (isFormControl || !enabled) return;

    const anchor = eTarget.closest("a");
    if (!anchor) return;

    event.preventDefault();

    const confirmed = showNavigationWarning();
    if (confirmed) {
      isNavigating.current = true;
      onCleanup();
      cleanupEventListeners();
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (e) {}
      window.location.href = anchor.href;
    }
  };

  const cleanupEventListeners = () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("popstate", handlePopState);
    window.removeEventListener("click", preventNavigation, true);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      const state = loadState();

      if (state?.hasPushed) {
        historyEntryCount.current = state.historyEntryCount;

        // pushState 다시 하지 않음 — 이미 삽입된 경우
        hasPushedInitialEntry.current = true;
      }
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const savedState = loadState();
    if (savedState?.hasPushed) {
      historyEntryCount.current = savedState.historyEntryCount || 0;
      hasPushedInitialEntry.current = true;
    }

    // 최초 한번만 pushState 실행
    if (!hasPushedInitialEntry.current) {
      addHistoryEntry();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("click", preventNavigation, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cleanupEventListeners();
      setTimeout(() => onCleanup?.(), 0);
    };
  }, [enabled]);
};

export default useNavigationBlocker;
