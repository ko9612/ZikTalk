import axiosInstance from "@/api/axiosInstance";
import { loginInfo } from "@/store/loginStore";

const useLogout = () => {
  const { logout } = loginInfo();

  const logoutHandler = async () => {
    try {
      await axiosInstance.post("/logout");

      logout();

      // axios 전역 Authorization 헤더 삭제
      delete axiosInstance.defaults.headers.common["Authorization"];
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return logoutHandler;
};

export default useLogout;
