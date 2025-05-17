import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import FaqItem from "@/components/common/FaqItem";
import EmptyBookmarkList from "./EmptyBookmarkList";
import { useBookmark } from "@/components/common/useBookmark";
import { useFilter } from "@/components/common/useFilter";
import Pagination from "@/components/common/Pagination";
import axios from "axios";
import { API_URL } from "@/api/myPageApi";
import {
  PAGE_SIZE,
  TEXT_COLORS,
  convertToBookmarkData,
  FilterComponent,
  TableHeader,
  LoadingIndicator,
} from "./settings";

// 로그인 필요 모달
const LoginRequiredModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">로그인 필요</h3>
        <p className="mb-6 text-gray-600">이 기능을 사용하려면 로그인이 필요합니다.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onLogin}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionBookmarkList = ({ testEmpty }) => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [openIds, setOpenIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleResults, setVisibleResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const { toggleBookmark } = useBookmark();
  const { filters, updateFilter } = useFilter({
    job: "직군·직무",
    questionType: "질문유형",
  });

  // 로그인 상태 확인 및 사용자 ID 추출
  useEffect(() => {
    const token = cookies.token;
    if (!token || typeof token !== "string") {
      setIsLoggedIn(false);
      setUserId(null);
      setLoginModalOpen(true); // 로그인되지 않은 상태로 마이페이지 접근 시 바로 모달 표시
      return;
    }
    
    try {
      const decoded = jwtDecode(token); // 토큰 유효성 검증
      const userIdFromToken = decoded.userId || decoded.sub || decoded.id;
      
      if (!userIdFromToken) {
        console.error("토큰에서 사용자 ID를 찾을 수 없습니다.");
        setIsLoggedIn(false);
        setUserId(null);
        setLoginModalOpen(true);
        return;
      }
      
      setIsLoggedIn(true);
      setUserId(userIdFromToken);
      console.log("토큰에서 추출한 사용자 ID:", userIdFromToken);
    } catch (err) {
      console.error("토큰 디코딩 실패:", err);
      setIsLoggedIn(false);
      setUserId(null);
      setLoginModalOpen(true);
    }
  }, [cookies.token]);

  const fetchBookmarkedQuestions = useCallback(async () => {
    if (!isLoggedIn || !userId) return; // 로그인하지 않은 상태에서는 API 호출 안함
    
    try {
      setLoading(true);
      setError(null);

      if (testEmpty) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      // userId 파라미터 추가
      const response = await axios.get(`${API_URL}/mypage/bookmarks`, {
        params: { userId }
      });
      
      if (!response.data || !response.data.questions) {
        setError("서버 응답 형식이 올바르지 않습니다.");
        setQuestions([]);
        setLoading(false);
        return;
      }

      const formattedQuestions = Array.isArray(response.data.questions)
        ? response.data.questions
            .map((q) => ({
              id: q.id, // 실제 ID는 유지
              career: q.interview?.role || "미분류",
              type: q.type === "JOB" ? "직무" : "인성",
              question: q.content,
              answer: q.myAnswer,
              recommendation: q.recommended,
              bookmarked: q.bookmarked || false,
              interviewId: q.interviewId,
              userId: q.userId // 사용자 ID 저장
            }))
            .filter((q) => q.bookmarked && q.userId === userId) // 현재 사용자의 북마크만 필터링
        : [];

      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (err) {
      setError(`질문 데이터 로딩 오류: ${err.message || "알 수 없는 오류"}`);
      setQuestions([]);
      setLoading(false);
    }
  }, [testEmpty, isLoggedIn, userId]);

  const handleBookmarkToggle = useCallback(
    async (id) => {
      if (!isLoggedIn || !userId) {
        setLoginModalOpen(true);
        return;
      }
      
      try {
        setQuestions((prev) => {
          const index = prev.findIndex((q) => q.id === id);
          if (index === -1) return prev;

          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            bookmarked: !updated[index].bookmarked,
          };
          return updated;
        });
        toggleBookmark(id);

        try {
          // userId 파라미터 추가
          await axios.patch(`${API_URL}/questions/${id}/bookmark`, {
            userId
          });
        } catch (err) {
          setError(`북마크 토글 실패: ${err.message || "네트워크 문제"}`);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === id ? { ...q, bookmarked: !q.bookmarked } : q,
            ),
          );
          toggleBookmark(id);
        }
      } catch (err) {
        setError(`북마크 토글 오류: ${err.message || "알 수 없는 오류"}`);
      }
    },
    [toggleBookmark, isLoggedIn, userId],
  );

  const filteredData = useMemo(() => {
    // 정렬 순서: 북마크된 항목이 최상단, 그 다음 id로 정렬
    const sortedQuestions = [...questions].sort((a, b) => {
      // 북마크 상태가 다르면 북마크된 항목이 먼저 오도록
      if (a.bookmarked !== b.bookmarked) {
        return a.bookmarked ? -1 : 1;
      }
      // 북마크 상태가 같으면 id 오름차순 정렬
      return a.id - b.id;
    });

    return sortedQuestions.filter((q) => {
      // 현재 사용자의 데이터만 반환
      if (q.userId && q.userId !== userId) return false;
      
      const jobMatch = filters.job === "직군·직무" || q.career === filters.job;
      const typeMatch =
        filters.questionType === "질문유형" || q.type === filters.questionType;
      return jobMatch && typeMatch;
    });
  }, [questions, filters.job, filters.questionType, userId]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  }, [filteredData.length]);

  const loadPageData = useCallback(
    (page) => {
      if (!isLoggedIn || !userId) return;
      
      setLoading(true);
      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      // 현재 페이지에 표시될 아이템
      const pageItems = filteredData.slice(startIndex, endIndex);

      // 페이지 내에서 순차적인 인덱스를 생성하여 표시 (1부터 시작)
      const itemsWithDisplayIndex = pageItems.map((item, index) => {
        const displayIndex = startIndex + index + 1; // 페이지 시작 인덱스 + 현재 인덱스 + 1 (1부터 시작하도록)
        const result = { ...item, displayIndex };
        console.log("변환된 항목:", result);
        return result;
      });

      setVisibleResults(itemsWithDisplayIndex);
      setLoading(false);
    },
    [filteredData, isLoggedIn, userId],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (!isLoggedIn || !userId) {
        setLoginModalOpen(true);
        return;
      }
      
      setCurrentPage(newPage);
      loadPageData(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [loadPageData, isLoggedIn, userId],
  );

  const toggleOpen = useCallback((id) => {
    if (!isLoggedIn || !userId) {
      setLoginModalOpen(true);
      return;
    }
    
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  }, [isLoggedIn, userId]);

  const handleJobFilterChange = useCallback(
    (value) => {
      if (!isLoggedIn || !userId) {
        setLoginModalOpen(true);
        return;
      }
      
      updateFilter("job", value);
      setCurrentPage(1);
    },
    [updateFilter, isLoggedIn, userId],
  );

  const handleTypeFilterChange = useCallback(
    (value) => {
      if (!isLoggedIn || !userId) {
        setLoginModalOpen(true);
        return;
      }
      
      updateFilter("questionType", value);
      setCurrentPage(1);
    },
    [updateFilter, isLoggedIn, userId],
  );
  
  // 로그인 페이지로 이동
  const handleLogin = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchBookmarkedQuestions();
    }
  }, [fetchBookmarkedQuestions, isLoggedIn, userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      loadPageData(currentPage);
    }
  }, [currentPage, filteredData, loadPageData, isLoggedIn, userId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // 로그인하지 않은 상태에서는 로그인 요청 UI만 표시
  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full pt-6">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-8">북마크 목록을 보려면 로그인이 필요합니다.</p>
          <button
            onClick={handleLogin}
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
        
        <LoginRequiredModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full pt-6">
      <h2
        className={`mb-6 text-center text-2xl font-bold sm:text-3xl ${TEXT_COLORS.title}`}
      >
        질문 북마크
      </h2>

      <FilterComponent
        filters={filters}
        onJobFilterChange={handleJobFilterChange}
        onTypeFilterChange={handleTypeFilterChange}
      />

      {error && (
        <div className="my-4 rounded-md bg-red-50 p-4 text-red-500">
          {error}
          <button
            className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
            onClick={() => {
              axios
                .get(`${API_URL}/mypage/bookmarks`, { params: { userId } })
                .then((res) => console.log("테스트 성공:", res.data))
                .catch((err) => console.error("테스트 실패:", err));
            }}
          >
            API 테스트
          </button>
        </div>
      )}

      {filteredData.length === 0 ? (
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
                {visibleResults.map((item) => {
                  console.log(
                    "렌더링 항목:",
                    item.id,
                    "displayId:",
                    item.displayIndex,
                  );
                  return (
                    <div key={item.id}>
                      <FaqItem
                        id={item.id}
                        displayId={item.displayIndex}
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
                  );
                })}
              </div>
            )}

            <div className="h-20">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </>
      )}
      
      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default QuestionBookmarkList;
