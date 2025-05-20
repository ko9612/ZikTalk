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
import FilterDropdown from "@/components/common/FilterDropdown";
const serverUrl = import.meta.env.VITE_SERVER_URL;

// 북마크 질문 목록 상태 관리 훅
const useBookmarkListState = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openIds, setOpenIds] = useState([]);

  // 북마크된 질문 데이터 가져오기
  const fetchBookmarkedQuestions = useCallback(
    async (pageNum, filters, userId) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/mypage/bookmarks", {
          params: {
            page: pageNum,
            pageSize: PAGE_SIZE,
            ...filters,
            userId,
          },
        });

        // 응답 데이터 형식화
        const formattedQuestions = response.data.questions.map((question) => ({
          id: question.id,
          career: question.interview?.role || "미분류",
          type: question.type === "JOB" ? "직무" : "인성",
          question: question.content,
          answer: question.myAnswer,
          recommendation: question.recommended,
          bookmarked: true,
          interviewId: question.interviewId,
        }));

        setVisibleResults(formattedQuestions);
        setCurrentPage(pageNum);
      } catch (err) {
        console.error("[북마크 데이터 로드 실패]", err);
        setError(err.message || "데이터를 불러올 수 없습니다");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 북마크 토글
  const toggleBookmark = useCallback(
    async (id, userId) => {
      if (!userId) {
        console.error("[ERROR] 북마크 토글 실패: 사용자 ID가 없습니다");
        setError("로그인이 필요한 기능입니다.");
        return false;
      }

      try {
        // 현재 북마크 상태 확인 후 반대 값 계산
        const itemToToggle = visibleResults.find((q) => q.id === id);
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

        console.log(
          "[DEBUG] 북마크 토글 API 호출:",
          id,
          "사용자 ID:",
          userId,
          "새 상태:",
          newBookmarkState,
        );
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
    },
    [visibleResults, toggleQuestionBookmark],
  );

  // 확장 토글
  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
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
      const hasAuthHeader =
        !!axiosInstance.defaults.headers.common["Authorization"];
      if (!hasAuthHeader) {
        console.log("[인증] 페이지 로드 시 토큰 복원 시도");
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          console.log("[인증] 토큰 복원 성공");
          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;
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

  const { currentPage, totalPages, visibleResults, loading, error, openIds } =
    state;

  const [dynamicJobOptions, setDynamicJobOptions] = useState([
    { value: "직군·직무", label: "직군·직무" },
  ]);

  // 모든 사용 가능한 직군/직무 옵션을 저장
  const [allAvailableJobOptions, setAllAvailableJobOptions] = useState([]);

  // 직군/직무 옵션 가져오기
  const loadAllJobOptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${serverUrl}/interview/user-info`,
        {
          // 경로 수정
          params: { userId },
        },
      );

      if (response.data?.roles) {
        const roleOptions = response.data.roles.map((role) => ({
          value: role,
          label: role,
        }));

        setDynamicJobOptions([
          { value: "직군·직무", label: "직군·직무" },
          ...roleOptions,
        ]);
        setAllAvailableJobOptions(roleOptions);
      }
    } catch (err) {
      console.error("[직군·직무 옵션 로드 실패]", err);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 모든 직군·직무 옵션 로드
  useEffect(() => {
    if (loginState && userId) {
      loadAllJobOptions();
    }
  }, [loginState, userId, loadAllJobOptions]);

  // 북마크 데이터가 변경될 때 현재 필터링된 결과에 없는 옵션도 유지
  useEffect(() => {
    if (allAvailableJobOptions.length > 0) {
      setDynamicJobOptions([
        { value: "직군·직무", label: "직군·직무" },
        ...allAvailableJobOptions,
      ]);
    } else {
      // 아직 모든 옵션이 로드되지 않은 경우 현재 결과에서 옵션 추출
      const originalData = state.visibleResults;

      // 현재 결과에서 사용 가능한 직군·직무 옵션 생성
      const uniqueRoles = Array.from(
        new Set(originalData.map((q) => q.career).filter(Boolean)),
      );

      setDynamicJobOptions([
        { value: "직군·직무", label: "직군·직무" },
        ...uniqueRoles.map((role) => ({ value: role, label: role })),
      ]);
    }
  }, [state.visibleResults, allAvailableJobOptions]);

  // 질문 유형 옵션 (고정 데이터)
  const questionTypeOptions = [
    { value: "질문유형", label: "질문유형" },
    { value: "직무", label: "직무" },
    { value: "인성", label: "인성" },
  ];

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (pageNum) => {
      if (!loginState || !userId) {
        navigate("/signin");
        return;
      }

      console.log(`[페이지네이션] 페이지 변경: ${currentPage} → ${pageNum}`);
      setCurrentPage(pageNum);
      fetchBookmarkedQuestions(pageNum, filters, userId);
    },
    [
      currentPage,
      fetchBookmarkedQuestions,
      filters,
      loginState,
      userId,
      navigate,
      setCurrentPage,
    ],
  );

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
      fetchBookmarkedQuestions(1, { ...filters, job: value }, userId).catch(
        (err) => {
          console.error("[필터 변경 오류]", err);
          // 에러 발생 시 빈 결과 표시하고 사용자에게 알림
          setVisibleResults([]);
          setError(
            `필터 적용 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
          );
          setLoading(false);
        },
      );
    },
    [
      updateFilter,
      filters,
      fetchBookmarkedQuestions,
      loginState,
      userId,
      navigate,
      setLoading,
      setCurrentPage,
      setError,
      setVisibleResults,
    ],
  );

  // 필터 변경 핸들러 - questionType
  const handleTypeFilterChange = useCallback(
    (value) => {
      if (!loginState || !userId) {
        navigate("/signin");
        return;
      }

      console.log(
        `[필터] 질문 유형 필터 변경: ${filters.questionType} → ${value}`,
      );

      // 로딩 상태 설정
      setLoading(true);
      setError(null);

      // 필터 상태 업데이트
      updateFilter("questionType", value);

      // 필터 변경 시 1페이지로 이동하고 데이터 새로 로드
      setCurrentPage(1);

      // 서버에 요청 전송
      fetchBookmarkedQuestions(
        1,
        { ...filters, questionType: value },
        userId,
      ).catch((err) => {
        console.error("[필터 변경 오류]", err);
        // 에러 발생 시 빈 결과 표시하고 사용자에게 알림
        setVisibleResults([]);
        setError(
          `필터 적용 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
        );
        setLoading(false);
      });
    },
    [
      updateFilter,
      filters,
      fetchBookmarkedQuestions,
      loginState,
      userId,
      navigate,
      setLoading,
      setCurrentPage,
      setError,
      setVisibleResults,
    ],
  );

  // 북마크 토글 핸들러
  const handleBookmarkToggle = useCallback(
    async (id) => {
      if (!loginState || !userId) {
        console.log("[북마크] 로그인 필요");
        setError("로그인이 필요한 기능입니다.");
        navigate("/signin");
        return;
      }

      try {
        // 현재 아이템 찾기
        const currentItem = visibleResults.find((item) => item.id === id);
        if (!currentItem) {
          console.error("[북마크] 아이템을 찾을 수 없음:", id);
          return;
        }

        const newBookmarkState = !currentItem.bookmarked;
        console.log("[북마크] 토글 시도:", {
          id,
          현재상태: currentItem.bookmarked,
          변경상태: newBookmarkState,
        });

        // 낙관적 UI 업데이트
        setVisibleResults((prev) => {
          // 북마크 해제 시 해당 아이템 즉시 제거
          if (!newBookmarkState) {
            console.log("[북마크] 아이템 제거:", id);
            return prev.filter((item) => item.id !== id);
          }
          // 북마크 추가 시 상태만 변경
          return prev.map((item) =>
            item.id === id ? { ...item, bookmarked: true } : item,
          );
        });

        // API 호출
        const response = await toggleQuestionBookmark(
          id,
          newBookmarkState,
          userId,
        );
        console.log("[북마크] API 응답:", response);

        // API 실패 시 상태 복원
        if (!response.success) {
          console.log("[북마크] API 실패 - 상태 복원");
          setVisibleResults((prev) => {
            if (!newBookmarkState) {
              // 북마크 해제 실패 시 아이템 복원
              return [...prev, { ...currentItem, bookmarked: true }];
            }
            // 북마크 추가 실패 시 상태 복원
            return prev.map((item) =>
              item.id === id ? { ...item, bookmarked: false } : item,
            );
          });
          throw new Error(response.message || "북마크 처리 실패");
        }

        // 성공 메시지 표시
        showToast(
          newBookmarkState
            ? "북마크가 추가되었습니다."
            : "북마크가 해제되었습니다.",
          "success",
        );
      } catch (err) {
        console.error("[북마크] 오류 발생:", err);
        showToast(
          err.message || "북마크 처리 중 오류가 발생했습니다.",
          "error",
        );
      }
    },
    [loginState, userId, visibleResults, navigate, showToast, setError],
  );

  // 컴포넌트 마운트 시 최초 1회만 데이터 로드
  useEffect(() => {
    // 로그인 상태와 userId 확인
    if (!initialDataLoaded && loginState && userId && !testEmpty) {
      console.log("[초기화] 북마크 데이터 로드 시작, 사용자 ID:", userId);

      // 데이터 로드 시도
      fetchBookmarkedQuestions(1, filters, userId);
      setInitialDataLoaded(true);
    }
  }, [
    initialDataLoaded,
    loginState,
    userId,
    filters,
    fetchBookmarkedQuestions,
    testEmpty,
  ]); // 필요한 의존성 추가

  const isEmpty = visibleResults.length === 0 && !loading;

  return (
    <div className="mx-auto w-full pt-6">
      <h2
        className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}
      >
        질문 북마크
      </h2>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <FilterDropdown
            value={filters.job}
            onChange={handleJobFilterChange}
            options={dynamicJobOptions}
            className="text-gray-500"
            buttonWidth="flex mr-14 h-10 w-auto min-w-24 gap-5 items-center justify-between truncate  border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
            dropdownWidth="w-auto"
          />

          <FilterDropdown
            value={filters.questionType}
            onChange={handleTypeFilterChange}
            options={questionTypeOptions}
            className="text-gray-500"
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
                const authHeader =
                  axiosInstance.defaults.headers.common["Authorization"];
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
