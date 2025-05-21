// 로그인, 회원가입 관련 api
import { loginInfo } from "@/store/loginStore";
import axiosInstance from "./axiosInstance";

export const signin = async (data) => {
  try {
    const res = await axiosInstance.post("/signin", data);
    const { userName } = res.data;

    onSigninSuccess(res);

    return { userName };
  } catch (e) {
    console.error("로그인 중 오류 발생", e);
    throw e;
  }
};

export const onSilentRefresh = async () => {
  try {
    const res = await axiosInstance.post("/silent-refresh");

    onSigninSuccess(res);
  } catch (e) {
    console.error("토큰 재발급 실패:", e);
    const { logout } = loginInfo.getState();
    logout();
  }
};

const onSigninSuccess = (res) => {
  const { accessToken } = res.data;

  // accessToken을 axios 인스턴스 헤더에 설정
  axiosInstance.defaults.headers.common["Authorization"] =
    `Bearer ${accessToken}`;
};

export const signup = async (data) => {
  try {
    await axiosInstance.post("/signup", data);
  } catch (e) {
    console.error("회원가입 중 오류 발생", e);
    throw e;
  }
};

export const verification = async (email) => {
  try {
    const res = await axiosInstance.post("/verification", {
      email,
    });

    return res.data.verificationCode;
  } catch (e) {
    console.error("이메일 인증 실패", e);
    throw e;
  }
};
