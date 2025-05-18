import axios from "axios";
import { loginInfo } from "@/store/loginStore";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // accessToken 만료
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refreshToken으로 새로운 accessToken 요청
        const { data } = await axiosInstance.post("/auth/refresh", null, {
          withCredentials: true, // 쿠키에 있는 refreshToken 보내기
        });

        const newAccessToken = data.accessToken;

        // 새 accessToken을 axios 전역 헤더에 설정
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // 실패 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refresh 실패 시 로그아웃
        const { logout } = loginInfo.getState();
        logout();

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
