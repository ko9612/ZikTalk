// 인터뷰 관련 api
import axiosInstance from "@/api/axiosInstance";
import axios from "axios";

// 일단 로컬로
const serverUrl = import.meta.env.VITE_SERVER_URL;

// gpt 질문 요청
export const getInterviewQuestion = async (level, qCount, career, ratio) => {
  try {
    const payload = {
      level,
      qCount,
      career,
      ratio,
    };
    const response = await axios.post(
      `${serverUrl}/interview/gpt-question`,
      payload,
    );
    const responseData = response.data;

    const questionData = responseData?.choices[0]?.message?.content.trim();
    const sanitizedContent = questionData.replace(/```json|```/g, "").trim();
    return JSON.parse(sanitizedContent);
  } catch (error) {
    throw error.message;
  }
};

// 동영상 파일 업로드
export const postVideo = async (blob, filename) => {
  try {
    const formData = new FormData();
    formData.append("file", blob, filename);
    console.log(serverUrl);
    await axios.post(`${serverUrl}/record/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.error(error);
  }
};

// gpt 피드백 요청
export const getInterviewFeedback = async (data) => {
  try {
    const response = await axios.post(
      `${serverUrl}/interview/gpt-feedback`,
      data,
    );
    const responseData = response.data;
    const questionData = responseData?.choices[0]?.message?.content.trim();
    const sanitizedContent = questionData.replace(/```json|```/g, "").trim();
    return JSON.parse(sanitizedContent);
  } catch (error) {
    throw error.message;
  }
};

// 면접 생성
export const createInterview = async (data) => {
  try {
    const response = await axiosInstance.post(`${serverUrl}/interview`, data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// 면접 페이지 접근 시 유저 정보 받아오기
export const getInterviewUserInfo = async () => {
  try {
    const response = await axiosInstance.get(
      `${serverUrl}/interview/user-info`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
