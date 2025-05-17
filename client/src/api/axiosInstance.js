// src/api/axiosInstance.js
import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();
const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // API 기본 주소
  withCredentials: true, // 쿠키를 요청과 함께 전송
});

axiosInstance.interceptors.request.use((config) => {
  // 여러 소스에서 토큰 조회 시도
  const cookieToken = cookies.get("token");
  const localToken = localStorage.getItem("accessToken");
  
  // 사용 가능한 토큰 선택 (쿠키 우선)
  const token = cookieToken || localToken;
  
  if (token) {
    // Authorization 헤더에 추가
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // 토큰이 없는 경우 처리
  }
  
  return config;
});

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 성공 처리
    return response;
  },
  (error) => {
    // 응답 오류 처리
    return Promise.reject(error);
  }
);

export default axiosInstance;
