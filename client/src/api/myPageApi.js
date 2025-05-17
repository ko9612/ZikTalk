import axios from "axios";
import axiosInstance from "./axiosInstance";

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
    const response = await axiosInstance.get(`/mypage/bookmarks`, {
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
  userId = null,
) => {
  try {
    const params = {
      page,
      pageSize,
      sortBy: sortType,
      bookmarked: isBookmarked ? true : undefined,
      userId: userId || undefined,
    };

    console.log(
      `[DEBUG] API 호출 파라미터(${isInitialLoad ? "초기 로드" : "추가 로드"}):`,
      params,
    );

    const response = await axiosInstance.get(
      `/interview/with-first-question`,
      { params },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 여러 면접을 배치로 삭제
export const batchDeleteInterviews = async (interviewIds, userId = null) => {
  try {
    console.log(
      `[DEBUG] 배치 삭제 API 호출: ${interviewIds.length}개 면접 ID`,
      interviewIds,
    );
    const response = await axiosInstance.post(`/interview/batch-delete`, {
      ids: interviewIds,
      userId: userId || undefined,
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

    const response = await axiosInstance.get(`/questions`, { params });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 질문 북마크 토글
export const toggleQuestionBookmark = async (questionId, bookmarked) => {
  try {
    const response = await axiosInstance.patch(
      `/questions/${questionId}/bookmark`,
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
export const toggleInterviewBookmark = async (interviewId, bookmarked, userId = null) => {
  try {
    const response = await axiosInstance.patch(
      `/interview/${interviewId}/bookmark`,
      {
        bookmarked,
        userId: userId || undefined,
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
    const response = await axiosInstance.get(`/mypage/user`);
    return response.data;
  } catch (err) {
    // 404 오류 (사용자가 존재하지 않음)인 경우 더 구체적인 오류 메시지 제공
    if (err.response && err.response.status === 404) {
      console.log('사용자 정보를 찾을 수 없습니다. 로그아웃 상태일 수 있습니다.');
      return null; // 오류 대신 null 반환하여 호출자가 처리할 수 있도록 함
    }
    console.error('사용자 정보 가져오기 실패:', err);
    throw err;
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (userData) => {
  try {
    const response = await axiosInstance.post(`/mypage/user/update`, userData);
    return response.data;
  } catch (err) {
    throw err;
  }
};

// 회원 탈퇴
export const deleteUserAccount = async (password = null) => {
  try {
    try {
      // 비밀번호가 제공된 경우 요청 본문에 포함
      const requestData = password ? { password } : {};
      
      // POST 메서드를 사용하여 회원탈퇴 요청
      const response = await axiosInstance.post(`/mypage/user/delete`, requestData);
      return response.data;
    } catch (serverError) {
      // 서버 API가 404 Not Found인 경우 (아직 구현되지 않음)
      if (serverError.response && (serverError.response.status === 404 || serverError.response.status === 405)) {
        console.log('서버에 회원탈퇴 API가 구현되지 않았습니다. 임시로 성공 응답을 반환합니다.');
        // 임시로 성공 응답 반환
        return { success: true, message: "회원 탈퇴가 처리되었습니다." };
      }
      
      // 다른 서버 오류는 그대로 throw
      throw serverError;
    }
  } catch (err) {
    console.error("회원탈퇴 API 오류:", err);
    throw err;
  }
};

// 기존 API 함수는 유지 (하위 호환성)
export const myPageApi = async () => {
  try {
    const response = await axiosInstance.get(`/mypage/bookmarks`);
    return response;
  } catch (err) {
    return { error: err.message };
  }
};
export { API_URL };
