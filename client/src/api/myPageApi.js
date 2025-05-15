import axios from "axios";

const API_URL = "http://localhost:5001/api";

// 로컬 스토리지에서 숨겨진 질문 ID 목록 가져오기
export const getHiddenQuestions = () => {
  try {
    return JSON.parse(localStorage.getItem("hiddenQuestions") || "[]");
  } catch (err) {
    console.error("로컬 스토리지 읽기 오류:", err);
    return [];
  }
};

// 북마크된 질문 목록 조회
export const fetchBookmarks = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    console.log(
      `[DEBUG] 북마크 API 호출: 페이지=${page}, 페이지크기=${pageSize}`,
    );
    const response = await axios.get(`${API_URL}/mypage/bookmarks`, {
      params: {
        page,
        pageSize,
        job: filters.job !== "직군·직무" ? filters.job : undefined,
        type:
          filters.questionType !== "질문유형"
            ? filters.questionType
            : undefined,
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 면접 목록 조회 (각 면접당 첫 번째 질문만 포함)
export const fetchInterviewsWithFirstQuestion = async (
  page = 1,
  pageSize = 6,
  sortType = "date",
  isBookmarked = false,
  isInitialLoad = false,
) => {
  try {
    const params = {
      page,
      pageSize,
      sortBy: sortType,
      bookmarked: isBookmarked ? true : undefined,
    };

    console.log(
      `[DEBUG] API 호출 파라미터(${isInitialLoad ? "초기 로드" : "추가 로드"}):`,
      params,
    );

    const response = await axios.get(
      `${API_URL}/interview/with-first-question`,
      { params },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 여러 면접을 배치로 삭제
export const batchDeleteInterviews = async (interviewIds) => {
  try {
    console.log(
      `[DEBUG] 배치 삭제 API 호출: ${interviewIds.length}개 면접 ID`,
      interviewIds,
    );
    const response = await axios.post(`${API_URL}/interview/batch-delete`, {
      ids: interviewIds,
    });
    return response.data;
  } catch (err) {
    console.error("[ERROR] 배치 삭제 실패:", err);
    throw err;
  }
};

// 질문 목록 조회 (마이페이지)
export const fetchQuestions = async (
  page = 1,
  pageSize = 10,
  sortType = "date",
  isBookmarked = false,
) => {
  try {
    const params = {
      page,
      pageSize,
      sortBy: sortType,
      bookmarked: isBookmarked ? true : undefined,
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
    const response = await axios.patch(
      `${API_URL}/questions/${questionId}/bookmark`,
      {
        bookmarked,
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 면접 북마크 토글
export const toggleInterviewBookmark = async (interviewId, bookmarked) => {
  try {
    const response = await axios.patch(
      `${API_URL}/interview/${interviewId}/bookmark`,
      {
        bookmarked,
      },
    );
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
    const response = await axios.get(
      "http://localhost:5001/api/mypage/bookmarks",
    );
    return response;
    return await fetchBookmarks();
  } catch (err) {
    return err.response;
    return { error: err.message };
  }
};
export { API_URL };
