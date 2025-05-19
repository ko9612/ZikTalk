import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFilter, SORT_OPTIONS } from "@/components/common/useFilter";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { loginInfo } from "@/store/loginStore";
import { fetchBookmarks, toggleQuestionBookmark } from "@/api/myPageApi";
import { useToast } from "@/hooks/useToast";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  TableHeader,
  LoadingIndicator,
} from "./settings";
import FaqItem from "@/components/common/FaqItem";
import axiosInstance from "@/api/axiosInstance";
import Pagination from "@/components/common/Pagination";
import FilterDropdown from '@/components/common/FilterDropdown';

// 북마크 질문 목록 상태 관리 훅
const useBookmarkListState = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);

  // 북마크된 질문 가져오기
  const fetchBookmarkedQuestions = useCallback(async (pageNum, filters, userId) => {
    if (!userId) {
      console.error("[ERROR] 북마크 데이터 로드 실패: 사용자 ID가 없습니다");
      setError("로그인이 필요한 기능입니다.");
      setLoading(false);
      return;
    }
    
    if (loading) {
      console.log("[DEBUG] 이미 로딩 중이므로 추가 요청 무시");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Authorization 헤더 확인 및 복원
      const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
      console.log("[북마크 로드] 인증 헤더 존재:", hasAuthHeader);
      
      if (!hasAuthHeader) {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        } else {
          setError("인증 정보가 없습니다. 로그인 후 다시 시도해주세요.");
          setLoading(false);
          return;
        }
      }

      // 필터 값 변환 - 서버로 전송할 필터 파라미터
      const filterParams = {
        job: filters.job !== "직군·직무" ? filters.job : undefined,
        questionType: filters.questionType !== "질문유형" ? filters.questionType : undefined
      };
      
      console.log("[DEBUG] 서버로 전송할 필터 파라미터:", filterParams);

      console.log("[DEBUG] 북마크 API 호출 파라미터:", { 
        page: pageNum, 
        pageSize: PAGE_SIZE, 
        filters: filterParams,
        userId,
        loadingState: loading,
        authHeader: axiosInstance.defaults.headers.common["Authorization"]
      });
      
      const response = await fetchBookmarks(pageNum, PAGE_SIZE, filterParams, userId);
      console.log("[DEBUG] 북마크 API 응답:", response);

      if (!response || !response.questions) {
        setError("서버 응답 형식이 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      const formattedQuestions = Array.isArray(response.questions)
        ? response.questions
            .map((q) => ({
              id: q.id,
              career: q.interview?.role || q.role || "미분류",
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked,
              interviewId: q.interviewId,
              userId: q.userId,
            }))
            // 클라이언트 측 필터링은 서버에서 이미 필터링된 데이터에 대해 수행하면 안 됨
            // 기본적인 사용자 ID 및 북마크 상태 확인만 유지
            .filter((q) => q.userId === userId && q.bookmarked)
        : [];

      console.log("[DEBUG] 처리된 북마크 질문 수:", formattedQuestions.length);
      
      setVisibleResults(formattedQuestions);
      
      // 전체 페이지 수 계산 (서버 응답에서 제공하지 않는 경우)
      if (response.totalPages) {
        setTotalPages(response.totalPages);
      } else if (response.totalCount) {
        setTotalPages(Math.ceil(response.totalCount / PAGE_SIZE));
      } else {
        // 페이지 정보가 없는 경우 현재 결과 수로 예상 계산
        const totalItemCount = formattedQuestions.length;
        setTotalPages(Math.max(1, Math.ceil(totalItemCount / PAGE_SIZE)));
      }
      
      setCurrentPage(pageNum);
      setLoading(false);
    } catch (err) {
      console.error("[ERROR] 북마크 데이터 로딩 오류:", err);
      
      if (err.isLoggedOut || 
          (err.response && err.response.status === 401) ||
          err.message.includes("Network Error")) {
        setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        
        const { logout } = loginInfo.getState();
        if (logout) {
          logout();
          delete axiosInstance.defaults.headers.common["Authorization"];
        }
      } else {
        setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      }
      
      setLoading(false);
    }
  }, [loading]);

  // 북마크 토글
  const toggleBookmark = useCallback(async (id, userId) => {
    if (!userId) {
      console.error("[ERROR] 북마크 토글 실패: 사용자 ID가 없습니다");
      setError("로그인이 필요한 기능입니다.");
      return false;
    }

    try {
      // 현재 북마크 상태 확인 후 반대 값 계산
      const itemToToggle = visibleResults.find(q => q.id === id);
      if (!itemToToggle) return false;
      
      const newBookmarkState = !itemToToggle.bookmarked;
      
      setVisibleResults((prev) => {
        const index = prev.findIndex((q) => q.id === id);
        if (index === -1) return prev;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          bookmarked: newBookmarkState,
        };
        return updated;
      });

      console.log("[DEBUG] 북마크 토글 API 호출:", id, "사용자 ID:", userId, "새 상태:", newBookmarkState);
      // 계산된 새로운 북마크 상태 전달
      await toggleQuestionBookmark(id, newBookmarkState);
      console.log("[DEBUG] 북마크 토글 성공");
      
      // 북마크가 해제된 경우에만 목록에서 제거
      if (!newBookmarkState) {
        setVisibleResults((prev) => prev.filter((q) => q.id !== id));
      }
      
      return true;
    } catch (err) {
      console.error("[ERROR] 북마크 토글 실패:", err);
      setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
      
      // 실패시 상태 원복
      setVisibleResults((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
        ),
      );
      
      return false;
    }
  }, [visibleResults, toggleQuestionBookmark]);

  // 확장 토글
  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id]
    );
  }, []);

  return {
    state: {
      currentPage,
      totalPages,
      visibleResults,
      loading,
      error,
      openIds,
    },
    fetchBookmarkedQuestions,
    toggleBookmark,
    toggleOpen,
    setLoading,
    setError,
    setVisibleResults,
    setCurrentPage,
  };
};

const QuestionBookmarkList = ({ testEmpty }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const userId = loginInfo((state) => state.userId);
  const loginState = loginInfo((state) => state.loginState);
  
  // 컴포넌트 마운트 시 인증 토큰 복원 시도
  useEffect(() => {
    const restoreToken = () => {
      const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
      if (!hasAuthHeader) {
        console.log("[인증] 페이지 로드 시 토큰 복원 시도");
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          console.log("[인증] 토큰 복원 성공");
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          return true;
        }
        console.warn("[인증] 토큰 복원 실패");
        return false;
      }
      return true;
    };
    
    restoreToken();
  }, []);
  
  // userId 확인 로깅
  useEffect(() => {
    console.log("[로그인 상태]", { loginState, userId, initialDataLoaded });
  }, [loginState, userId, initialDataLoaded]);
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  const {
    state,
    fetchBookmarkedQuestions,
    toggleBookmark,
    toggleOpen,
    setLoading,
    setError,
    setVisibleResults,
    setCurrentPage,
  } = useBookmarkListState();

  const {
    currentPage,
    totalPages,
    visibleResults,
    loading,
    error,
    openIds,
  } = state;

  const [dynamicJobOptions, setDynamicJobOptions] = useState([
    { value: '직군·직무', label: '직군·직무' }
  ]);

  // 모든 사용 가능한 직군/직무 옵션을 저장
  const [allAvailableJobOptions, setAllAvailableJobOptions] = useState([]);

  // 모든 가능한 직군·직무 옵션을 로드하는 함수
  const loadAllJobOptions = useCallback(async () => {
    try {
      console.log("[직군·직무 옵션] 전체 옵션 로드 시도");
      
      // 기본 옵션 항상 포함
      const defaultOption = { value: '직군·직무', label: '직군·직무' };
      
      // 이미 로드된 옵션이 있으면 사용
      if (allAvailableJobOptions.length > 1) {
        console.log("[직군·직무 옵션] 기존 옵션 재사용:", allAvailableJobOptions.length);
        setDynamicJobOptions([defaultOption, ...allAvailableJobOptions]);
        return;
      }
      
      // 필터 없이 북마크 데이터 로드 시도
      if (userId) {
        try {
          console.log("[직군·직무 옵션] 모든 북마크 데이터 조회 시도");
          const response = await fetchBookmarks(1, 100, { job: undefined, questionType: undefined }, userId);
          
          if (response && response.questions && response.questions.length > 0) {
            // 모든 직군·직무 값 추출
            const allRoles = response.questions
              .map(q => q.interview?.role || q.role || q.career || null)
              .filter(Boolean);
            
            // 중복 제거
            const uniqueRoles = Array.from(new Set(allRoles));
            console.log("[직군·직무 옵션] 추출된 고유 직군·직무:", uniqueRoles);
            
            // 옵션 변환 및 저장
            const roleOptions = uniqueRoles.map(role => ({ value: role, label: role }));
            setAllAvailableJobOptions(roleOptions);
            
            // 드롭다운 업데이트
            setDynamicJobOptions([defaultOption, ...roleOptions]);
          }
        } catch (err) {
          console.error("[직군·직무 옵션] 로드 오류:", err);
          // 오류 발생 시 기본 옵션만 유지
          setDynamicJobOptions([defaultOption]);
        }
      }
    } catch (err) {
      console.error("[직군·직무 옵션] 처리 오류:", err);
    }
  }, [userId, allAvailableJobOptions]);

  // 컴포넌트 마운트 시 모든 직군·직무 옵션 로드
  useEffect(() => {
    if (userId && loginState) {
      loadAllJobOptions();
    }
  }, [userId, loginState, loadAllJobOptions]);

  // 북마크 데이터가 변경될 때 현재 필터링된 결과에 없는 옵션도 유지
  useEffect(() => {
    if (allAvailableJobOptions.length > 0) {
      setDynamicJobOptions([
        { value: '직군·직무', label: '직군·직무' },
        ...allAvailableJobOptions
      ]);
    } else {
      // 아직 모든 옵션이 로드되지 않은 경우 현재 결과에서 옵션 추출
      const originalData = state.visibleResults;
      
      // 현재 결과에서 사용 가능한 직군·직무 옵션 생성
      const uniqueRoles = Array.from(
        new Set(originalData.map(q => q.career).filter(Boolean))
      );
      
      setDynamicJobOptions([
        { value: '직군·직무', label: '직군·직무' },
        ...uniqueRoles.map(role => ({ value: role, label: role }))
      ]);
    }
  }, [state.visibleResults, allAvailableJobOptions]);
  
  // 질문 유형 옵션 
  const questionTypeOptions = [
    { value: '질문유형', label: '질문유형' },
    { value: '직무', label: '직무' },
    { value: '인성', label: '인성' }
  ];

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((pageNum) => {
    if (!loginState || !userId) {
      navigate("/signin");
      return;
    }
    
    console.log(`[페이지네이션] 페이지 변경: ${currentPage} → ${pageNum}`);
    setCurrentPage(pageNum);
    fetchBookmarkedQuestions(pageNum, filters, userId);
  }, [currentPage, fetchBookmarkedQuestions, filters, loginState, userId, navigate, setCurrentPage]);

  // 필터 변경 핸들러 - job
  const handleJobFilterChange = useCallback(
    (value) => {
      if (!loginState || !userId) {
        navigate("/signin");
        return;
      }

      console.log(`[필터] 직무 필터 변경: ${filters.job} → ${value}`);
      
      // 로딩 상태 설정
      setLoading(true);
      setError(null);
      
      // 필터 상태 업데이트
      updateFilter("job", value);
      
      // 필터 변경 시 1페이지로 이동하고 데이터 새로 로드
      setCurrentPage(1);
      
      // 서버에 요청 전송
      fetchBookmarkedQuestions(1, { ...filters, job: value }, userId)
        .catch(err => {
          console.error("[필터 변경 오류]", err);
          // 에러 발생 시 빈 결과 표시하고 사용자에게 알림
          setVisibleResults([]);
          setError(`필터 적용 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`);
          setLoading(false);
        });
    },
    [updateFilter, filters, fetchBookmarkedQuestions, loginState, userId, navigate, setLoading, setCurrentPage, setError, setVisibleResults],
  );

  // 필터 변경 핸들러 - questionType
  const handleTypeFilterChange = useCallback(
    (value) => {
      if (!loginState || !userId) {
        navigate("/signin");
        return;
      }

      console.log(`[필터] 질문 유형 필터 변경: ${filters.questionType} → ${value}`);
      
      // 로딩 상태 설정
      setLoading(true);
      setError(null);
      
      // 필터 상태 업데이트
      updateFilter("questionType", value);
      
      // 필터 변경 시 1페이지로 이동하고 데이터 새로 로드
      setCurrentPage(1);
      
      // 서버에 요청 전송
      fetchBookmarkedQuestions(1, { ...filters, questionType: value }, userId)
        .catch(err => {
          console.error("[필터 변경 오류]", err);
          // 에러 발생 시 빈 결과 표시하고 사용자에게 알림
          setVisibleResults([]);
          setError(`필터 적용 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`);
          setLoading(false);
        });
    },
    [updateFilter, filters, fetchBookmarkedQuestions, loginState, userId, navigate, setLoading, setCurrentPage, setError, setVisibleResults],
  );

  // 북마크 토글 핸들러
  const handleBookmarkToggle = useCallback(
    async (id) => {
      if (!loginState || !userId) {
        console.error("[ERROR] 북마크 토글 실패: 로그인되지 않음");
        setError("로그인이 필요한 기능입니다.");
        navigate("/signin");
        return;
      }

      try {
        // Authorization 헤더 확인 및 복원
        const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
        console.log("[북마크 토글] 인증 헤더 존재:", hasAuthHeader);
        
        if (!hasAuthHeader) {
          console.log("[북마크 토글] 인증 헤더가 없습니다. 토큰 복원 시도...");
          const storedToken = localStorage.getItem('accessToken');
          if (storedToken) {
            console.log("[북마크 토글] 로컬 스토리지에서 토큰 복원 성공");
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          } else {
            console.warn("[북마크 토글] 토큰 복원 실패");
            setError("인증 정보가 없습니다. 새로고침 후 다시 시도해주세요.");
            return;
          }
        }

        // 현재 아이템 찾기
        const currentItem = visibleResults.find(item => item.id === id);
        
        // 현재 아이템이 없는 경우(이미 목록에서 제거된 경우) 새로운 아이템 생성
        const isExistingItem = !!currentItem;
        
        // 북마크 상태 토글 (현재 목록에 없는 경우 기본값 false에서 true로 변경)
        const newBookmarkState = isExistingItem ? !currentItem.bookmarked : true;
        console.log("[북마크 토글] 시작, ID:", id, "사용자 ID:", userId, "새 상태:", newBookmarkState, "목록에 존재:", isExistingItem);
        
        // API 직접 호출 - userId 명시적 전달
        const result = await toggleQuestionBookmark(id, newBookmarkState, userId);
        console.log("[북마크 토글] API 응답:", result);
        
        // 성공 여부 확인
        if (result && result.success === false) {
          throw new Error(result.message || "북마크 토글 실패");
        }
        
        if (isExistingItem) {
          // 기존 아이템이 목록에 있는 경우
          if (!newBookmarkState) {
            // 북마크 해제된 경우 목록에서 제거
            setVisibleResults(prev => prev.filter(item => item.id !== id));
            console.log("[북마크 토글] 북마크 해제로 인해 목록에서 제거됨:", id);
          } else {
            // 북마크 설정된 경우 - 현재 목록에서 상태만 업데이트
            setVisibleResults(prev => 
              prev.map(item => 
                item.id === id ? {...item, bookmarked: true} : item
              )
            );
            console.log("[북마크 토글] 북마크 설정됨, 목록에 유지:", id);
          }
        } else {
          // 현재 목록에 없는 아이템의 북마크를 true로 설정한 경우 
          if (newBookmarkState) {
            console.log("[북마크 토글] 새로운 북마크 아이템, 자동 새로고침 없음:", id);
            showToast("북마크가 설정되었습니다. 새로고침하면 목록에 표시됩니다.", "success");
            
            // 자동 새로고침 없이 사용자에게 알림만 표시
            // 페이지 새로고침이나 수동 새로고침 버튼 클릭으로 데이터를 새로 불러오도록 안내
          }
        }
        
        console.log("[북마크 토글] 성공");
      } catch (err) {
        console.error("[ERROR] 북마크 토글 중 예외 발생:", err);
        
        // UI 상태 복원 (필요한 경우)
        const currentItem = visibleResults.find(item => item.id === id);
        if (currentItem) {
          setVisibleResults(prev => 
            prev.map(item => 
              item.id === id ? {...item, bookmarked: !item.bookmarked} : item
            )
          );
        }
        
        // 인증 오류 처리
        if (err.isLoggedOut || (err.response && err.response.status === 401)) {
          setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/signin");
        } else {
          setError(`북마크 토글 실패: ${err.message || "알 수 없는 오류"}`);
        }
      }
    },
    [loginState, userId, navigate, setError, visibleResults, showToast],
  );

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    // 로그인 상태와 userId 확인
    if (!initialDataLoaded && loginState && userId && !testEmpty) {
      console.log("[초기화] 북마크 데이터 로드 시작, 사용자 ID:", userId);
      
      // 데이터 로드 시도
      fetchBookmarkedQuestions(1, filters, userId);
      setInitialDataLoaded(true);
    } else if (!initialDataLoaded) {
      console.log("[초기화] 데이터 로드 건너뜀:", { 
        loginState, 
        userId, 
        testEmpty, 
        initialDataLoaded 
      });
      
      // testEmpty가 true이거나 로그인 정보가 없는 경우 초기화 완료 처리
      if (testEmpty || !loginState || !userId) {
        setInitialDataLoaded(true);
      }
    }
  }, [initialDataLoaded, fetchBookmarkedQuestions, filters, loginState, userId, testEmpty, navigate, setError]);

  const isEmpty = visibleResults.length === 0 && !loading;

  return (
    <div className="mx-auto w-full pt-6">
      <h2
        className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}
      >
        질문 북마크
      </h2>

      <div className="flex justify-between items-center mb-4 ">
        <div className="flex space-x-2">
          <FilterDropdown 
            value={filters.job}
            onChange={handleJobFilterChange}
            options={dynamicJobOptions}
            className=" text-gray-500"
            buttonWidth="flex mr-14 h-10 w-auto min-w-24 gap-5 items-center justify-between truncate  border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
            dropdownWidth="w-auto"
          />
          
          <FilterDropdown 
            value={filters.questionType}
            onChange={handleTypeFilterChange}
            options={questionTypeOptions}
            className=" text-gray-500"
            buttonWidth="flex h-10 w-auto min-w-24  gap-7 items-center justify-between truncate border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
            dropdownWidth="w-auto"
          />
        </div>
        
       
      </div>

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
          {error.includes("로그인") ? (
            <button
              className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
              onClick={() => {
                navigate("/signin");
              }}
            >
              로그인 페이지로 이동
            </button>
          ) : (
            <button
              className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
              onClick={() => {
                console.log("[DEBUG] 재시도 버튼 클릭");
                
                // Authorization 헤더 확인
                const authHeader = axiosInstance.defaults.headers.common["Authorization"];
                console.log("[DEBUG] Authorization 헤더 상태:", !!authHeader);
                
                if (loginState && userId) {
                  // 데이터 다시 로드 시도
                  fetchBookmarkedQuestions(currentPage, filters, userId);
                } else {
                  navigate("/signin");
                }
              }}
            >
              다시 시도
            </button>
          )}
        </div>
      )}

      {isEmpty ? (
        <EmptyBookmarkList
          job={filters.job}
          setJob={handleJobFilterChange}
          type={filters.questionType}
          setType={handleTypeFilterChange}
          isCareerModalOpen={false}
          setCareerModalOpen={() => {}}
        />
      ) : (
        <>
          <TableHeader />

          <div className="mb-4 h-full overflow-y-hidden rounded-lg">
            {loading ? (
              <LoadingIndicator />
            ) : (
              <div className="min-h-[350px] p-2">
                {visibleResults.map((item, index) => (
                  <div key={item.id}>
                    <FaqItem
                      id={item.id}
                      displayId={index + 1}
                      career={item.career}
                      type={item.type}
                      question={item.question}
                      answer={item.answer}
                      recommendation={item.recommendation}
                      isExpanded={openIds.includes(item.id)}
                      onToggle={() => toggleOpen(item.id)}
                      isStarred={item.bookmarked}
                      onStarToggle={() => handleBookmarkToggle(item.id)}
                      textColors={TEXT_COLORS}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* 페이지네이션 컴포넌트 추가 */}
            {!isEmpty && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
