// 인터뷰 관련 api
import axios from "axios";

// 일단 로컬로
const API_BASE_URL = "http://localhost:5001/api";

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
      `${API_BASE_URL}/interview/gpt-question`,
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

// 음성인식 후, text 변환
export const getTextConverter = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append("audioBlob", audioBlob);

    const response = await axios.post(`${API_BASE_URL}/daglo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.transcript;
  } catch (error) {
    console.error("Daglo API Error:", error);
    throw new Error("음성 변환 실패");
  }
};
