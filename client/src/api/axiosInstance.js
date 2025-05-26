import axios from "axios";
import { loginInfo } from "@/store/loginStore";
const serverUrl = import.meta.env.VITE_SERVER_URL;
const axiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const excludedUrls = ["/signin", "/signup", "/silent-refresh"];
    if (excludedUrls.some((url) => originalRequest.url.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // 요청 실패시 자동 재시도 안 함
      originalRequest._retry = true;

      try {
        // refreshToken으로 새로운 accessToken 요청
        const res = await axiosInstance.post("/silent-refresh");
        const newAccessToken = res.data.accessToken;

        // 새 accessToken을 axios 전역 헤더에 설정
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refreshToken 만료시 로그아웃
        const { logout } = loginInfo.getState();
        logout();

        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
