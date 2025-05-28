import axiosInstance from "@/api/axiosInstance";
import { loginInfo } from "@/store/loginStore";
import axios from "axios";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_LOGOUT_REDIRECT_URI = import.meta.env
  .VITE_KAKAO_LOGOUT_REDIRECT_URI;

export const useLogout = () => {
  const { logout, provider } = loginInfo();
  const logoutHandler = async () => {
    try {
      await axiosInstance.post("/logout");

      logout();

      // axios 전역 Authorization 헤더 삭제
      delete axiosInstance.defaults.headers.common["Authorization"];

      // 카카오 로그아웃
      if (provider === "kakao") {
        const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_REST_API_KEY}&logout_redirect_uri=${encodeURIComponent(KAKAO_LOGOUT_REDIRECT_URI)}`;
        window.location.href = kakaoLogoutUrl;
      }
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return logoutHandler;
};

export const useDeleteKaKaoUser = () => {
  const deleteUserHandler = async (kakaoToken) => {
    try {
      const res = await axios.post(
        "https://kapi.kakao.com/v1/user/unlink",
        {},
        {
          headers: {
            Authorization: `Bearer ${kakaoToken}`,
          },
        },
      );
      delete axiosInstance.defaults.headers.common["Authorization"];
      return res;
    } catch (error) {
      console.error("회원탈퇴 실패:", error);
    }
  };
  return deleteUserHandler;
};
