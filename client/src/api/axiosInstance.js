import axios from "axios";
import { loginInfo } from "@/store/loginStore";
const serverUrl = import.meta.env.VITE_SERVER_URL;
const axiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // 현재 URL 확인 - 북마크 관련 페이지 여부 확인
    const isBookmarkPage = window.location.pathname.includes("/bookmark");
    const isMyPageRequest = originalRequest?.url?.includes("/mypage");

    // 북마크 페이지에서 /mypage 요청이면 로그아웃 처리하지 않고 오류만 반환
    if (isBookmarkPage && isMyPageRequest && error.response?.status === 401) {
      console.warn(
        "[인증 오류] 북마크 페이지에서 인증 오류 발생, 로그아웃 처리를 건너뜁니다",
      );
      return Promise.reject({
        ...error,
        isBookmarkPage: true,
      });
    }

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
        // // refresh 실패 시 로그아웃

        // 북마크 페이지에서는 로그아웃 처리를 건너뜀
        if (isBookmarkPage) {
          console.warn(
            "[인증 실패] 북마크 페이지에서 리프레시 토큰 만료, 로그아웃 건너뜀",
          );
          return Promise.reject({
            ...refreshError,
            isBookmarkPage: true,
          });
        }

        const { logout } = loginInfo.getState();
        if (logout) logout();
        console.log("[인증 실패] 리프레시 토큰 만료로 인한 로그아웃");
        console.log("[인증 실패] 상세 내용:", {
          error: refreshError?.response?.data || refreshError?.message,
          status: refreshError?.response?.status,
          timestamp: new Date().toISOString(),
        });

        // 로컬 스토리지 토큰 삭제
        localStorage.removeItem("accessToken");

        // 로그인 페이지로 이동
        window.location.href = "/signin";
        console.log("리프레시 토큰 만료로 인한 로그아웃");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
