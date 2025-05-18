import axios from "axios";
import { loginInfo } from "@/store/loginStore";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("토큰이 만료되었습니다.");

      try {
        // refresh token 재발급 -> 실패시 로그아웃으로 수정해야 함
        await axiosInstance.post("/logout");

        loginInfo.getState().logout();

        window.location.href = "/signin";
      } catch (e) {
        console.log("자동 로그아웃 실패: ", e);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
