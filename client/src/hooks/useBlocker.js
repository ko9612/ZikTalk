import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const useBlocker = (message, when) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = message;
    };

    const handlePopState = (event) => {
      const userConfirmed = window.confirm(message);
      if (!userConfirmed) {
        // 뒤로가기를 막기 위해 현재 위치로 다시 이동
        navigate(location.pathname);
      }
    };

    const handleLinkClick = (event) => {
      const target = event.target.closest("a");
      if (target && target.href) {
        const isSameOrigin = target.origin === window.location.origin;
        if (isSameOrigin && !target.href.includes(location.pathname)) {
          const userConfirmed = window.confirm(message);
          if (!userConfirmed) {
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick);
    };
  }, [when, message, navigate, location]);

  return null;
};

export default useBlocker;
