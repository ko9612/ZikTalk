// 로그인, 회원가입 관련 api
import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export const signin = async (data) => {
  try {
    const res = await axios.post(`${serverUrl}/signin`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    const { user, accessToken } = res.data;

    // API 요청시 헤더에 accessToken 담아 보내도록 설정
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    return { user };
  } catch (e) {
    console.error("로그인 중 오류 발생", e);
    throw e;
  }
};

export const signup = async (data) => {
  try {
    await axios.post(`${serverUrl}/signup`, data);
  } catch (e) {
    console.error("회원가입 중 오류 발생", e);
    throw e;
  }
};

export const verification = async (email) => {
  try {
    const res = await axios.post(`${serverUrl}/verification`, {
      email,
    });

    return res.data.verificationCode;
  } catch (e) {
    console.error("이메일 인증 실패", e);
    throw e;
  }
};
