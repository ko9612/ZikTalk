import axiosInstance from "@/api/axiosInstance";
import { loginInfo } from "@/store/loginStore";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_LOGOUT_REDIRECT_URI = import.meta.env
  .VITE_KAKAO_LOGOUT_REDIRECT_URI;

const useLogout = () => {
  const { logout } = loginInfo();

  const logoutHandler = async () => {
    try {
      await axiosInstance.post("/logout");

      logout();

      // axios 전역 Authorization 헤더 삭제
      delete axiosInstance.defaults.headers.common["Authorization"];

      // 카카오 로그아웃
      const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_REST_API_KEY}&logout_redirect_uri=${encodeURIComponent(KAKAO_LOGOUT_REDIRECT_URI)}`;
      window.location.href = kakaoLogoutUrl;
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return logoutHandler;
};

export default useLogout;
