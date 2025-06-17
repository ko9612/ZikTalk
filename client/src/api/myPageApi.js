import axiosInstance from "./axiosInstance";

export const fetchBookmarks = async (
  page = 1,
  pageSize = 10,
  role = null,
  type = null,
) => {
  try {
    const params = {
      page,
      pageSize,
      ...(role && { role }),
      ...(type && { type }),
    };

    const response = await axiosInstance.get("/mypage/bookmarks", { params });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchInterviewsWithFirstQuestion = async () => {
  try {
    const response = await axiosInstance.get(`/interviews/`);
    if (!response.data?.interviews) {
      throw new Error("면접 데이터가 없습니다.");
    }
    return response.data.interviews;
  } catch (error) {
    throw error;
  }
};

export const batchDeleteInterviews = async (interviewIds) => {
  try {
    const response = await axiosInstance.post(`/interview/batch-delete`, {
      ids: interviewIds,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const toggleQuestionBookmark = async (questionId) => {
  try {
    const response = await axiosInstance.patch(
      `/questions/${questionId}/bookmark`,
    );
  } catch (error) {
    throw error;
  }
};

export const toggleInterviewBookmark = async (interviewId, bookmarked) => {
  try {
    const response = await axiosInstance.patch(
      `/interview/${interviewId}/bookmark`,
      {
        bookmarked,
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const fetchUserInfo = async () => {
  try {
    const response = await axiosInstance.get("/mypage/user");

    if (!response.data) {
      throw new Error("사용자 정보를 가져올 수 없습니다.");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (userData) => {
  try {
    const careerValue =
      userData.career === "신입"
        ? 0
        : userData.career === "1 ~ 3년"
          ? 1
          : userData.career === "4 ~ 7년"
            ? 2
            : userData.career === "7년 이상"
              ? 3
              : undefined;

    // 요청 데이터 구조화
    const requestData = {
      ...userData,
      career: careerValue,
    };

    const response = await axiosInstance.post(
      "/mypage/user/update",
      requestData,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// 회원 탈퇴
export const deleteUserAccount = async () => {
  try {
    const response = await axiosInstance.post(`/mypage/user/delete`);

    return response.data;
  } catch (err) {
    if (err.response) {
      const errorMessage =
        err.response.data.message || "회원 탈퇴 처리 중 오류가 발생했습니다.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};
// 기존 API 함수는 유지 (하위 호환성)
export const myPageApi = async () => {
  try {
    const response = await axiosInstance.get(`/mypage/bookmarks`);
    return response;
  } catch (err) {}
};
