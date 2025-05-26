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
    if (!userId) {
      console.log('[BOOKMARK API] 사용자 ID가 없어 빈 결과 반환');
      return { questions: [] };
    }
    
    const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
    if (!hasAuthHeader) {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } else {
        return { questions: [], error: '인증 정보가 없습니다. 로그인 후 다시 시도해주세요.' };
      }
    }
    
    // 기본 파라미터 - 필터 없음
    const baseParams = {
      page,
      pageSize,
      bookmarked: true,
      userId: userId
    };
    
    // 필터 적용 여부 확인
    const hasFilters = (filters.job && filters.job !== "직군·직무") || 
                      (filters.questionType && filters.questionType !== "질문유형");
    
    // 필터 적용된 파라미터
    let params = { ...baseParams };
    
    // 필터 값이 있는 경우에만 파라미터에 추가
    if (filters.job && filters.job !== "직군·직무") {
      // 직무/직군 필터링을 위해 role 또는 career로 전달
      params.role = filters.job;
      // 아래 필드도 동일하게 설정 (서버측에서 OR 조건으로 처리)
      params.career = filters.job;
      
      console.log('[BOOKMARK API] 직군/직무 필터링:', filters.job);
    }
    
    if (filters.questionType && filters.questionType !== "질문유형") {
      // 질문 유형 필터링
      params.type = filters.questionType === "직무" ? "JOB" : "PERSONALITY";
      console.log('[BOOKMARK API] 질문 유형 필터링:', params.type);
    }
    
    // 페이지 정보 확실하게 보장 (중복 체크)
    if (typeof page === 'number' && page > 0) {
      params.page = page;
    } else {
      params.page = 1;
    }
    
    console.log('[BOOKMARK API] 요청 파라미터:', params);
    
    try {
      // 필터를 적용하여 API 호출 시도
      const response = await axiosInstance.get(`/mypage/bookmarks`, { params });
      console.log('[BOOKMARK API] 응답:', response.data);
      return response.data;
    } catch (filterError) {
      // 필터 적용 시 오류가 발생한 경우
      console.error('[BOOKMARK API] 필터 적용 중 오류 발생:', filterError);
      
      if (hasFilters) {
        // 필터가 적용되어 있었다면, 필터 없이 재시도
        console.log('[BOOKMARK API] 필터 없이 재시도합니다.');
        const fallbackResponse = await axiosInstance.get(`/mypage/bookmarks`, { params: baseParams });
        
        // 클라이언트 측에서 필터링 수행
        const filteredData = { ...fallbackResponse.data };
        
        if (filters.job && filters.job !== "직군·직무") {
          const jobFilter = filters.job;
          console.log('[BOOKMARK API] 클라이언트 측 직무 필터링:', jobFilter);
          
          filteredData.questions = filteredData.questions.filter(q => 
            (q.role === jobFilter) || 
            (q.interview?.role === jobFilter) || 
            (q.career === jobFilter)
          );
        }
        
        if (filters.questionType && filters.questionType !== "질문유형") {
          const typeValue = filters.questionType === "직무" ? "JOB" : "PERSONALITY";
          console.log('[BOOKMARK API] 클라이언트 측 유형 필터링:', typeValue);
          
          filteredData.questions = filteredData.questions.filter(q => 
            q.type === typeValue
          );
        }
        
        // 클라이언트 측 필터링 결과 반환
        console.log('[BOOKMARK API] 클라이언트 측 필터링 결과:', filteredData.questions.length);
        
        // 필터링된 결과의 페이지네이션 정보 업데이트
        filteredData.totalCount = filteredData.questions.length;
        filteredData.totalPages = Math.max(1, Math.ceil(filteredData.totalCount / pageSize));
        
        return filteredData;
      }
      
      // 필터가 없었는데도 오류가 발생한 경우 오류 전파
      throw filterError;
    }
  } catch (err) {
    console.error('[BOOKMARK API] 오류:', err);
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
    console.error("[fetchUserInfo] 사용자 정보 가져오기 실패:", err);
    console.error("[fetchUserInfo] 오류 상세:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      message: err.message
    });
    
    // 404 오류를 포함한 모든 오류를 그대로 전파
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
