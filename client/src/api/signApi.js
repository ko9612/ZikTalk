// 로그인, 회원가입 관련 api
import axios from "axios";
import axiosInstance from "./axiosInstance";

const BASE_URL = "http://localhost:5001/api";

export const signin = async (data) => {
  console.log("🔑 로그인 시도:", { email: data.email });
  
  try {
    const res = await axios.post(`${BASE_URL}/signin`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    const { userName, accessToken } = res.data;
    console.log("🔑 로그인 성공:", { userName, accessToken: accessToken ? "토큰 있음" : "토큰 없음" });

    // 로컬 스토리지에 accessToken 저장
    localStorage.setItem("accessToken", accessToken);
    console.log("🔑 로컬 스토리지에 토큰 저장됨");

    // API 요청시 헤더에 accessToken 담아 보내도록 설정
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    console.log("🔑 API 헤더에 토큰 설정됨");

    return { userName };
  } catch (e) {
    console.error("🔑 로그인 중 오류 발생", e);
    throw e;
  }
};

export const logout = async () => {
  console.log("🔑 로그아웃 시도");
  try {
    await axiosInstance.post("/auth/logout");
    console.log("🔑 로그아웃 API 호출 성공");
    
    // 토큰 제거
    localStorage.removeItem("accessToken");
    console.log("🔑 로컬 스토리지에서 토큰 제거됨");
    
    delete axios.defaults.headers.common["Authorization"];
    delete axiosInstance.defaults.headers.common["Authorization"];
    console.log("🔑 API 헤더에서 인증 정보 제거됨");
  } catch (e) {
    console.error("🔑 로그아웃 중 오류 발생", e);
  }
};

export const signup = async (data) => {
  try {
    await axios.post(`${BASE_URL}/signup`, data);
  } catch (e) {
    console.error("회원가입 중 오류 발생", e);
    throw e;
  }
};

export const verification = async (email) => {
  try {
    const res = await axios.post(`${BASE_URL}/verification`, {
      email,
    });

    return res.data.verificationCode;
  } catch (e) {
    console.error("이메일 인증 실패", e);
    throw e;
  }
};
