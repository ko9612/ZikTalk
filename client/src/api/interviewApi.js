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

// 동영상 파일 업로드
export const postVideo = async (blob, filename) => {
  try {
    const formData = new FormData();
    formData.append("file", blob, filename);

    await axios.post("http://localhost:5001/api/record/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.error(error);
  }
};
