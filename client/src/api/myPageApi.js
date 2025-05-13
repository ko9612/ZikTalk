// 마이페이지 관련 api
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// 로컬 스토리지에서 숨겨진 질문 ID 목록 가져오기
export const getHiddenQuestions = () => {
  try {
    return JSON.parse(localStorage.getItem('hiddenQuestions') || '[]');
  } catch (err) {
    console.error('로컬 스토리지 읽기 오류:', err);
    return [];
  }
};

// 질문 숨기기
export const hideQuestion = (questionId) => {
  try {
    const hiddenQuestions = getHiddenQuestions();
    if (!hiddenQuestions.includes(questionId)) {
      hiddenQuestions.push(questionId);
      localStorage.setItem('hiddenQuestions', JSON.stringify(hiddenQuestions));
    }
    return true;
  } catch (err) {
    console.error('숨김 처리 오류:', err);
    return false;
  }
};

// 숨김 해제
export const unhideQuestion = (questionId) => {
  try {
    const hiddenQuestions = getHiddenQuestions();
    const updatedList = hiddenQuestions.filter(id => id !== questionId);
    localStorage.setItem('hiddenQuestions', JSON.stringify(updatedList));
    return true;
  } catch (err) {
    console.error('숨김 해제 오류:', err);
    return false;
  }
};

// 북마크된 질문 목록 조회
export const fetchBookmarks = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/mypage/bookmarks`, {
      params: {
        page,
        pageSize,
        job: filters.job !== "직군·직무" ? filters.job : undefined,
        type: filters.questionType !== "질문유형" ? filters.questionType : undefined
      }
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 질문 목록 조회 (마이페이지)
export const fetchQuestions = async (page = 1, pageSize = 10, sortType = 'date', isBookmarked = false) => {
  try {
    const params = {
      page,
      pageSize,
      sortBy: sortType,
      bookmarked: isBookmarked ? true : undefined
    };
    
    const response = await axios.get(`${API_URL}/questions`, { params });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 질문 북마크 토글
export const toggleQuestionBookmark = async (questionId, bookmarked) => {
  try {
    const response = await axios.patch(`${API_URL}/questions/${questionId}/bookmark`, {
      bookmarked
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 사용자 정보 조회
export const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/mypage/user`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (userData) => {
  try {
    const response = await axios.patch(`${API_URL}/mypage/user`, userData);
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 회원 탈퇴
export const deleteUserAccount = async () => {
  try {
    const response = await axios.delete(`${API_URL}/mypage/user`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 기존 API 함수는 유지 (하위 호환성)
export const myPageApi = async () => {
  try {
    return await fetchBookmarks();
  } catch (err) {
    return { error: err.message };
  }
};
