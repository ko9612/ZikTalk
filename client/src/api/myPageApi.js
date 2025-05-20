import axiosInstance from "./axiosInstance";
import { loginInfo } from "@/store/loginStore";

const serverUrl = import.meta.env.VITE_SERVER_URL;

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
export const fetchBookmarks = async (
  page = 1,
  pageSize = 10,
  filters = {},
  userId = null,
) => {
  try {
    const response = await axiosInstance.get("/api/bookmarks", {
      params: {
        page,
        pageSize,
        ...filters,
        userId,
      },
    });

    // 응답 데이터 유효성 검사
    if (!response.data || !Array.isArray(response.data.questions)) {
      console.error("[API] 유효하지 않은 응답:", response);
      throw new Error("서버 응답 형식이 올바르지 않습니다.");
    }

    return response.data;
  } catch (err) {
    console.error("[API] 북마크 조회 실패:", err);
    throw err;
  }
};

// 면접 목록 조회 (각 면접당 첫 번째 질문만 포함)
export const fetchInterviewsWithFirstQuestion = async (userId) => {
  try {
    console.log("[API] 면접 결과 조회 시작:", userId);
    const response = await axiosInstance.get("/api/mypage/interviews", {
      params: { userId },
    });

    if (!response.data) {
      throw new Error("데이터를 불러올 수 없습니다.");
    }

    return response.data;
  } catch (error) {
    console.error("[API] 면접 결과 조회 실패:", error);
    throw error;
  }
};

// 여러 면접을 배치로 삭제
export const batchDeleteInterviews = async (interviewIds, userId) => {
  try {
    console.log("[API] 면접 결과 삭제 시도:", { interviewIds, userId });

    if (!interviewIds?.length) {
      throw new Error("삭제할 면접 ID가 없습니다.");
    }

    // 각 면접을 개별적으로 삭제
    const deletePromises = interviewIds.map((interviewId) =>
      axiosInstance.delete(`${serverUrl}/interview/${interviewId}`, {
        data: { userId },
      }),
    );

    const results = await Promise.all(deletePromises);
    console.log("[API] 면접 결과 삭제 응답:", results);

    // 모든 삭제가 성공했는지 확인
    const allSuccess = results.every((r) => r.data?.success !== false);

    return {
      success: allSuccess,
      message: allSuccess
        ? "면접 결과가 삭제되었습니다."
        : "일부 항목 삭제에 실패했습니다.",
    };
  } catch (error) {
    console.error("[API] 면접 결과 삭제 실패:", error);
    throw error;
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
export const toggleQuestionBookmark = async (
  questionId,
  bookmarked,
  userId = null,
) => {
  try {
    console.log("[toggleQuestionBookmark] 호출:", {
      questionId,
      bookmarked,
      userId,
    });

    // // 토큰 유효성 확인
    // const hasToken = !!axiosInstance.defaults.headers.common["Authorization"];
    // if (!hasToken) {
    //   const storedToken = localStorage.getItem("accessToken");
    //   if (storedToken) {
    //     console.log("[toggleQuestionBookmark] 토큰 복원");
    //     axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    //   } else {
    //     console.warn("[toggleQuestionBookmark] 저장된 토큰 없음");
    //   }
    // }

    // userId 확인 (함수 인자로 전달되지 않은 경우 로그인 스토어에서 가져오기)
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      try {
        effectiveUserId = loginInfo.getState().userId;
        console.log(
          "[toggleQuestionBookmark] 스토어에서 userId 가져옴:",
          effectiveUserId,
        );
      } catch (e) {
        console.warn(
          "[toggleQuestionBookmark] 스토어에서 userId를 가져올 수 없음:",
          e,
        );
      }
    }

    const response = await axiosInstance.patch(
      `/questions/${questionId}/bookmark`,
      {
        bookmarked,
        userId: effectiveUserId, // 사용자 ID 추가
      },
    );
    console.log("[toggleQuestionBookmark] 응답:", response.data);
    return response.data;
  } catch (err) {
    console.error("[toggleQuestionBookmark] 오류:", err);

    // 401 인증 오류 및 CORS 문제 관련 특별 처리
    if (
      err.response?.status === 401 ||
      err.message?.includes("Network Error")
    ) {
      console.warn(
        "[toggleQuestionBookmark] 인증 오류 또는 네트워크 문제:",
        err.message,
      );

      // UI에 오류 표시용 객체 반환
      return {
        success: false,
        message: "인증에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.",
        error: err.message,
      };
    }

    throw err;
  }
};

// 면접 북마크 토글
export const toggleInterviewBookmark = async (interviewId, userId) => {
  try {
    console.log("[API] 북마크 토글 시도:", { interviewId, userId });

    const response = await axiosInstance.patch(
      `${serverUrl}/interview/${interviewId}/bookmark`,
      {
        userId,
      },
    );

    // response.data의 구조 확인
    const { success = true, bookmarked, message } = response.data;

    console.log("[API] 북마크 토글 성공:", response.data);

    return {
      success,
      bookmarked: Boolean(bookmarked),
      message:
        message ||
        (bookmarked ? "북마크가 추가되었습니다." : "북마크가 해제되었습니다."),
    };
  } catch (error) {
    console.error("[API] 북마크 토글 실패:", error);
    throw error;
  }
};

// 사용자 정보 조회 - 경로 수정
export const fetchUserInfo = async () => {
  try {
    console.log("[API] 사용자 정보 조회 시도:@@@@@");
    // const token = localStorage.getItem("accessToken");
    // console.log("@@@@", token);
    const response = await axiosInstance.get(`${serverUrl}/mypage/user`); // 경로 수정
    console.log("[API] 사용자 정보 조회 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("[API] 사용자 정보 조회 실패:", error);
    throw error;
  }
};

// 사용자 정보 업데이트 - 경로 수정
export const updateUserInfo = async (updateData) => {
  try {
    console.log("[API] 사용자 정보 업데이트 시도:", updateData);
    const response = await axiosInstance.post(
      `${serverUrl}/mypage/user/update`,
      updateData,
    );
    console.log("[API] 사용자 정보 업데이트 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("[API] 사용자 정보 업데이트 실패:", error);
    throw error;
  }
};

// 회원 탈퇴
export const deleteUserAccount = async (
  password = null,
  passedUserId = null,
) => {
  console.log("[회원탈퇴] API 호출 시작");

  try {
    // userId 확인 (인자로 전달되지 않은 경우 스토어에서 가져오기)
    let userId = passedUserId;

    if (!userId) {
      try {
        userId = loginInfo.getState().userId;
        console.log("[회원탈퇴] 스토어에서 userId 가져옴:", userId);
      } catch (e) {
        console.warn("[회원탈퇴] 스토어에서 userId를 가져올 수 없음:", e);
        throw new Error("사용자 ID를 찾을 수 없습니다.");
      }
    }

    if (!userId) {
      throw new Error("사용자 인증이 필요합니다.");
    }

    // 요청 데이터 준비
    const requestData = {
      userId,
      password,
    };

    console.log("[회원탈퇴] 요청 준비:", {
      userId,
      hasPassword: !!password,
      hasAuthHeader: !!axiosInstance.defaults.headers.common["Authorization"],
    });

    const response = await axiosInstance.post(
      `${serverUrl}/mypage/user/delete`,
      requestData,
    );

    console.log("[회원탈퇴] 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("[회원탈퇴] 실패:", error);

    // 에러 상세 정보 로깅
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        "회원 탈퇴 처리 중 오류가 발생했습니다.";
      console.error("[회원탈퇴] 서버 응답:", {
        status: error.response.status,
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 경력 숫자-문자열 변환 유틸리티 함수
export const convertCareerStringToNumber = (careerString) => {
  switch (careerString) {
    case "신입":
      return 0;
    case "1 ~ 3년":
      return 1;
    case "4 ~ 7년":
      return 2;
    case "7년 이상":
      return 3;
    default:
      return 0;
  }
};

export const convertCareerNumberToString = (careerNumber) => {
  switch (careerNumber) {
    case 0:
      return "신입";
    case 1:
      return "1 ~ 3년";
    case 2:
      return "4 ~ 7년";
    case 3:
      return "7년 이상";
    default:
      return "신입";
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
export { serverUrl };
