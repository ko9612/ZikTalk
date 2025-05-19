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
export const fetchBookmarks = async (page = 1, pageSize = 10, filters = {}, userId = null) => {
  console.log('[BOOKMARK API] 호출 시작 - 파라미터:', { page, pageSize, filters, userId });
  
  try {
    // 로그인 정보가 없는 경우 빈 데이터 반환
    if (!userId) {
      console.log('[BOOKMARK API] 사용자 ID가 없어 빈 결과 반환');
      console.warn('[BOOKMARK API] 호출 문제 디버그:', { 
        userId: userId,
        userIdType: typeof userId,
        hasFilters: !!filters,
        filtersType: typeof filters,
        page: page
      });
      return { questions: [] };
    }
    
    // 인증 헤더 확인 및 복원
    const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
    if (!hasAuthHeader) {
      console.log('[BOOKMARK API] 인증 헤더가 없습니다. 토큰 복원 시도...');
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        console.log('[BOOKMARK API] 토큰 복원 성공');
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } else {
        console.warn('[BOOKMARK API] 저장된 토큰 없음');
        return { questions: [], error: '인증 정보가 없습니다. 로그인 후 다시 시도해주세요.' };
      }
    }
    
    const params = {
      page,
      pageSize,
      bookmarked: true, // 항상 북마크된 항목만 가져오도록 고정
      userId: userId, // 토큰에서 추출한 userId 전달
      job: filters.job !== "직군·직무" ? filters.job : undefined,
      type:
        filters.questionType !== "질문유형"
          ? filters.questionType
          : undefined,
    };
    
    console.log('[BOOKMARK API] 요청 파라미터:', params);
    console.log('[BOOKMARK API] 요청 URL:', `${serverUrl}/mypage/bookmarks`);
    console.log('[BOOKMARK API] 인증 헤더:', axiosInstance.defaults.headers.common["Authorization"]);
    
    // 요청 타임아웃 설정
    const timeoutId = setTimeout(() => {
      console.log('[BOOKMARK API] 요청 시간 초과 (3초)');
      throw new Error('요청 시간 초과');
    }, 3000);
    
    try {
      const response = await axiosInstance.get(`/mypage/bookmarks`, {
        params,
      });
      
      // 타임아웃 취소
      clearTimeout(timeoutId);
      
      console.log('[BOOKMARK API] 응답 상태 코드:', response.status);
      console.log('[BOOKMARK API] 응답 데이터 헤더:', response.headers);
      console.log('[BOOKMARK API] 응답 데이터:', response.data);
      
      // 응답 데이터 유효성 검사
      if (!response.data) {
        console.warn('[BOOKMARK API] 응답 데이터가 없음');
        return { questions: [] };
      }
      
      if (!response.data.questions) {
        console.warn('[BOOKMARK API] 유효하지 않은 응답 형식:', response.data);
        // questions 속성이 없으면 빈 배열로 추가
        return { ...response.data, questions: [] };
      }
      
      console.log('[BOOKMARK API] 받은 질문 수:', response.data.questions.length);
      return response.data;
    } catch (innerError) {
      clearTimeout(timeoutId);
      console.error('[BOOKMARK API] 내부 에러:', innerError.message);
      
      // 인증 에러 처리 개선 - 401 에러가 발생해도 단순 빈 배열만 반환
      if (innerError.response && innerError.response.status === 401) {
        console.warn('[BOOKMARK API] 인증 문제 발생 (401), 에러:', innerError.message);
        return { questions: [], error: '인증 문제가 발생했습니다.' };
      }
      
      // 에러 발생 시 빈 questions 배열 반환
      return { questions: [] };
    }
  } catch (outerError) {
    console.error('[BOOKMARK API] 외부 에러:', outerError.message);
    // 모든 예외 상황에서 빈 questions 배열 반환
    return { questions: [] };
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

    const response = await axiosInstance.get(`/interview/with-first-question`, {
      params,
    });
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
export const toggleQuestionBookmark = async (questionId, bookmarked, userId = null) => {
  try {
    console.log("[toggleQuestionBookmark] 호출:", { questionId, bookmarked, userId });
    
    // 토큰 유효성 확인
    const hasToken = !!axiosInstance.defaults.headers.common["Authorization"];
    if (!hasToken) {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        console.log("[toggleQuestionBookmark] 토큰 복원");
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } else {
        console.warn("[toggleQuestionBookmark] 저장된 토큰 없음");
      }
    }
    
    // userId 확인 (함수 인자로 전달되지 않은 경우 로그인 스토어에서 가져오기)
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      try {
        effectiveUserId = loginInfo.getState().userId;
        console.log("[toggleQuestionBookmark] 스토어에서 userId 가져옴:", effectiveUserId);
      } catch (e) {
        console.warn("[toggleQuestionBookmark] 스토어에서 userId를 가져올 수 없음:", e);
      }
    }
    
    const response = await axiosInstance.patch(
      `/questions/${questionId}/bookmark`,
      {
        bookmarked,
        userId: effectiveUserId // 사용자 ID 추가
      },
    );
    console.log("[toggleQuestionBookmark] 응답:", response.data);
    return response.data;
  } catch (err) {
    console.error("[toggleQuestionBookmark] 오류:", err);
    
    // 401 인증 오류 및 CORS 문제 관련 특별 처리
    if (err.response?.status === 401 || err.message?.includes("Network Error")) {
      console.warn("[toggleQuestionBookmark] 인증 오류 또는 네트워크 문제:", err.message);
      
      // UI에 오류 표시용 객체 반환
      return {
        success: false,
        message: "인증에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.",
        error: err.message
      };
    }
    
    throw err;
  }
};

// 면접 북마크 토글
export const toggleInterviewBookmark = async (
  interviewId,
  bookmarked,
  userId = null,
) => {
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
export const fetchUserInfo = async (userId) => {
  console.log("[fetchUserInfo] 호출 시작");
  try {
    console.log("[fetchUserInfo] 요청 URL:", `/mypage/user?userId=${userId}`);
    console.log("[fetchUserInfo] Authorization 헤더:", axiosInstance.defaults.headers.common["Authorization"]);
    
    const response = await axiosInstance.get(`/mypage/user?userId=${userId}`);
    console.log("[fetchUserInfo] 성공적으로 응답 받음:", response.status);
    console.log("[fetchUserInfo] 응답 데이터:", response.data);
    
    return response.data;
  } catch (err) {
    // 404 오류 (사용자가 존재하지 않음)인 경우 더 구체적인 오류 메시지 제공
    if (err.response && err.response.status === 404) {
      console.log(
        "[fetchUserInfo] 사용자 정보를 찾을 수 없습니다. 로그아웃 상태일 수 있습니다.",
      );
      return null; // 오류 대신 null 반환하여 호출자가 처리할 수 있도록 함
    }
    
    console.error("[fetchUserInfo] 사용자 정보 가져오기 실패:", err);
    console.error("[fetchUserInfo] 오류 상세:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      message: err.message
    });
    
    throw err;
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (userData) => {
  console.log("[updateUserInfo] API 호출 시작");
  console.log("[updateUserInfo] 요청 데이터:", userData);
  console.log("[updateUserInfo] Authorization 헤더:", axiosInstance.defaults.headers.common["Authorization"]);
  console.log("[updateUserInfo] 요청 URL:", `${serverUrl}/mypage/user/update`);
  
  try {
    const response = await axiosInstance.post(`/mypage/user/update`, userData);
    console.log("[updateUserInfo] 성공적으로 응답 받음:", response.status);
    console.log("[updateUserInfo] 응답 데이터:", response.data);
    return response.data;
  } catch (err) {
    console.error("[updateUserInfo] API 오류 발생:", err);
    
    // 오류 상세 로깅
    if (err.response) {
      console.error("[updateUserInfo] 서버 응답 오류:", {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers
      });
    } else if (err.request) {
      console.error("[updateUserInfo] 요청은 전송됐으나 응답 없음:", err.request);
    } else {
      console.error("[updateUserInfo] 요청 설정 중 오류:", err.message);
    }
    
    throw err;
  }
};

// 회원 탈퇴
export const deleteUserAccount = async (password = null, passedUserId = null) => {
  console.log("[deleteUserAccount] API 호출 시작");
  
  try {
    // userId 가져오기 (함수 인자나 스토어에서)
    let userId = passedUserId; // 우선 전달된 userId 사용
    
    if (!userId) {
      try {
        const { getState } = loginInfo;
        userId = getState().userId;
      } catch (e) {
        console.warn("[deleteUserAccount] 스토어에서 userId를 가져올 수 없습니다:", e);
      }
    }
    
    console.log("[deleteUserAccount] 요청 준비:", {
      password: password ? "***" : null,
      userId: userId,
      hasAuthHeader: !!axiosInstance.defaults.headers.common["Authorization"]
    });
    
    // 요청 본문 구성 - userId 명시적 포함
    const requestData = {
      userId: userId,
      password: password
    };
    
    console.log("[deleteUserAccount] 요청 URL:", `${serverUrl}/mypage/user/delete`);
    console.log("[deleteUserAccount] 요청 데이터:", { ...requestData, password: password ? "***" : null });
    
    const response = await axiosInstance.post(`/mypage/user/delete`, requestData);
    
    console.log("[deleteUserAccount] 응답 받음:", {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (err) {
    console.error("[deleteUserAccount] 오류 발생:", err);
    
    // 오류 세부 정보 로깅
    if (err.response) {
      console.error("[deleteUserAccount] 서버 응답 오류:", {
        status: err.response.status,
        data: err.response.data
      });
    } else if (err.request) {
      console.error("[deleteUserAccount] 요청은 전송됐으나 응답 없음");
    } else {
      console.error("[deleteUserAccount] 요청 설정 오류:", err.message);
    }
    
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
export { serverUrl };
