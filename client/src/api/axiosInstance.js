// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // API 기본 주소
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // accessToken 저장된 값
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
