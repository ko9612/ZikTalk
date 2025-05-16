// 로그인, 회원가입 관련 api
import axios from "axios";

const BASE_URL = "http://localhost:5001/api";

export const signin = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/signin`, data);
    return res.data.user.token;
  } catch (err) {
    console.error("로그인 중 오류 발생", err);
    throw err;
  }
};

export const signup = async (data) => {
  try {
    await axios.post(`${BASE_URL}/signup`, data);
  } catch (err) {
    console.error("회원가입 중 오류 발생", err);
    throw err;
  }
};
