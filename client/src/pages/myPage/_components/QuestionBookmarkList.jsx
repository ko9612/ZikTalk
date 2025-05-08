import React, { useState, useEffect, useRef, useCallback } from "react";
import { faqData } from "@/data/faqData";
import { FaStar } from "react-icons/fa";
import EmptyBookmarkList from "./EmptyBookmarkList";

const getBookmarkedIds = () => {
  try {
    return JSON.parse(localStorage.getItem("questionBookmarks")) || [];
  } catch {
    return [];
  }
};

const PAGE_SIZE = 5;

// 북마크 데이터 변환 (title, desc → job, type, question)
const convertToBookmarkData = (item) => {
  return {
    ...item,
    job: item.career || "",
    type: item.type || "",
    question: item.question || "",
    answer: item.answer || "",
    recommendation: item.recommendation || "",
  };
};

const QuestionBookmarkList = ({ testEmpty }) => {
  const [openIds, setOpenIds] = useState([]);
  const [job, setJob] = useState("직군·직무");
  const [questionType, setQuestionType] = useState("질문유형");
  const [starredItems, setStarredItems] = useState(getBookmarkedIds());
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // 무한 스크롤 관련 상태 추가
  const [page, setPage] = useState(0);
  const [visibleResults, setVisibleResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const observer = useRef();
  
  const toggleBookmark = (id) => {
    const updated = starredItems.includes(id)
      ? starredItems.filter((bid) => bid !== id)
      : [...starredItems, id];
    setStarredItems(updated);
    localStorage.setItem("questionBookmarks", JSON.stringify(updated));
  };

  const toggleOpen = (id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  };

  // 클릭 이벤트 핸들러를 위한 ref
  const jobDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(e.target)) {
        setShowJobDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setShowTypeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 북마크 여부 포함하여 전체 데이터 변환 및 필터링
  const getFilteredBookmarks = () => {
    return testEmpty
      ? []
      : faqData
          .filter((item) => {
            // 1. 직무(job) 필터링
            const careerMatch = job === "직군·직무" || item.job === job;
            // 2. 질문유형 필터링
            const typeMatch = questionType === "질문유형" || item.type === questionType;
            // 3. 기존 type '일반' 제외 필터링
            const notGeneral = item.type !== "일반";
            return careerMatch && typeMatch && notGeneral;
          })
          .map((item) => ({
            ...convertToBookmarkData(item),
            isBookmarked: starredItems.includes(item.id),
          }));
  };

  // 마지막 요소 참조 콜백 함수
  const lastResultElementRef = useCallback(node => {
    // 사용자가 스크롤하지 않았거나 로딩 중이면 관찰하지 않음
    if (loading || !userScrolled) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && userScrolled) {
        loadMoreResults();
      }
    }, {
      root: null,
      rootMargin: '0px 0px 50px 0px',
      threshold: 0.5
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, userScrolled]);

  // 스크롤 이벤트 처리
  useEffect(() => {
    // 초기 스크롤 위치 저장
    let prevScrollY = window.scrollY;
    let scrolledDown = false;
    let scrollTimeout;
    
    const handleScroll = () => {
      // 사용자 스크롤 상태를 true로 설정
      if (!userScrolled) {
        setUserScrolled(true);
      }
      
      // 스크롤 디바운싱 (스크롤 이벤트가 너무 자주 발생하는 것 방지)
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        // 사용자가 아래로 스크롤 했는지 확인
        const currentScrollY = window.scrollY;
        scrolledDown = currentScrollY > prevScrollY;
        prevScrollY = currentScrollY;
        
        // 아래로 스크롤했을 때만 로드하고, 충분히 아래로 내려갔을 때만 트리거
        if (
          scrolledDown &&
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
          !loading &&
          hasMore
        ) {
          loadMoreResults();
        }
      }, 100); // 디바운싱 시간
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [loading, hasMore, userScrolled]);

  // 추가 결과 로드 함수
  const loadMoreResults = () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    // 실제 API 호출 대신 지연 시간 추가 (시뮬레이션)
    setTimeout(() => {
      const filteredBookmarks = getFilteredBookmarks();
      const nextPageResults = filteredBookmarks.slice((page + 1) * PAGE_SIZE, (page + 2) * PAGE_SIZE);
      
      if (nextPageResults.length === 0) {
        setHasMore(false);
      } else {
        setVisibleResults(prev => [...prev, ...nextPageResults]);
        setPage(prevPage => prevPage + 1);
      }
      
      setLoading(false);
    }, 300); // 로딩 시간
  };

  // 필터 변경 시 데이터 리셋
  useEffect(() => {
    const filteredBookmarks = getFilteredBookmarks();
    setVisibleResults(filteredBookmarks.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(filteredBookmarks.length > PAGE_SIZE);
    setUserScrolled(false); // 필터 변경 시 스크롤 상태 초기화
  }, [job, questionType, starredItems]);

  // 초기 데이터 로드
  useEffect(() => {
    const filteredBookmarks = getFilteredBookmarks();
    setVisibleResults(filteredBookmarks.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(filteredBookmarks.length > PAGE_SIZE);
    setUserScrolled(false); // 초기 로드 시 스크롤 상태 초기화
  }, [testEmpty]);

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      {visibleResults.length === 0 && page === 0 ? (
        <EmptyBookmarkList
          job={job}
          setJob={setJob}
          questionType={questionType}
          setQuestionType={setQuestionType}
        />
      ) : (
        <>
          <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
            질문 북마크
          </h2>
          {/* 필터 영역 */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {/* 직무 드롭다운 */}
              <div className="relative" ref={jobDropdownRef}>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-full border border-gray-300 bg-white px-1 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none"
                  onClick={() => setShowJobDropdown(!showJobDropdown)}
                  aria-haspopup="listbox"
                  aria-expanded={showJobDropdown}
                >
                  {job}
                  <span className={`ml-1 transition-transform duration-200 ${showJobDropdown ? "rotate-180" : ""}`}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 20 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                        fill="#7B7B7B"
                        stroke="#DFDFDF"
                        strokeWidth="0.0488281"
                      />
                    </svg>
                  </span>
                </button>
                {/* 드롭다운 메뉴 */}
                <div
                  className={`absolute z-10 mt-1 w-full min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out ${
                    showJobDropdown
                      ? "max-h-60 scale-100 transform opacity-100"
                      : "pointer-events-none max-h-0 scale-95 transform opacity-0"
                  }`}
                >
                  <ul className="py-2" role="listbox">
                    {[
                      { value: "직군·직무", label: "직군·직무" },
                      { value: "프론트엔드 개발자", label: "프론트엔드 개발자" },
                      { value: "백엔드 개발자", label: "백엔드 개발자" }
                    ].map((option) => (
                      <li
                        key={option.value}
                        className={`cursor-pointer px-1 py-2 text-sm transition-colors duration-200 hover:bg-gray-100 ${
                          job === option.value
                            ? "bg-gray-50 font-medium text-zik-main"
                            : "text-gray-700"
                        }`}
                        role="option"
                        aria-selected={job === option.value}
                        onClick={() => {
                          setJob(option.value);
                          setShowJobDropdown(false);
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* 질문유형 드롭다운 */}
              <div className="relative" ref={typeDropdownRef}>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-full border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  aria-haspopup="listbox"
                  aria-expanded={showTypeDropdown}
                >
                  {questionType}
                  <span className={`ml-1 transition-transform duration-200 ${showTypeDropdown ? "rotate-180" : ""}`}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 20 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                        fill="#7B7B7B"
                        stroke="#DFDFDF"
                        strokeWidth="0.0488281"
                      />
                    </svg>
                  </span>
                </button>
                {/* 드롭다운 메뉴 */}
                <div
                  className={`absolute z-10 mt-1 w-full min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out ${
                    showTypeDropdown
                      ? "max-h-60 scale-100 transform opacity-100"
                      : "pointer-events-none max-h-0 scale-95 transform opacity-0"
                  }`}
                >
                  <ul className="py-2" role="listbox">
                    {[
                      { value: "질문유형", label: "질문유형" },
                      { value: "인성", label: "인성" },
                      { value: "직무", label: "직무" }
                    ].map((option) => (
                      <li
                        key={option.value}
                        className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-100 ${
                          questionType === option.value
                            ? "bg-gray-50 font-medium text-zik-main"
                            : "text-gray-700"
                        }`}
                        role="option"
                        aria-selected={questionType === option.value}
                        onClick={() => {
                          setQuestionType(option.value);
                          setShowTypeDropdown(false);
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* 표 헤더 */}
          <div className="mb-3 hidden grid-cols-12 items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 text-xs font-semibold tracking-wide text-gray-400 sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base">
            <div className="pr-4 text-center sm:pr-6 md:pr-14">No</div>
            <div className="col-span-0 pr-4 text-center sm:pr-6 md:pr-13">
              직무
            </div>
            <div className="col-span-1 pl-4 text-center sm:pl-6 md:pl-12">
              유형
            </div>
            <div className="col-span-8 pl-4 text-left sm:pl-6 md:pl-25">
              질문
            </div>
            <div className="col-span-1 flex justify-center">즐겨찾기</div>
          </div>
          {/* 데이터 */}
          {visibleResults.map((item, idx) => (
            <div 
              key={item.id} 
              className="mb-3"
              ref={idx === visibleResults.length - 1 ? lastResultElementRef : null}
            >
              <div className="relative mr-2 ml-1 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow transition hover:shadow-lg">
                {/* 버튼 그룹: 오른쪽 상단에 고정 (FaqItem 스타일) */}
                <div className="absolute top-3 right-4 z-10 flex flex-row items-center gap-2">
                  {/* 토글 버튼 */}
                  <button
                    onClick={() => toggleOpen(item.id)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 hover:bg-gray-100 sm:h-8 sm:w-8 ${openIds.includes(item.id) ? "rotate-180" : ""}`}
                    aria-expanded={openIds.includes(item.id)}
                    aria-label={openIds.includes(item.id) ? "접기" : "펼치기"}
                  >
                    <span className="transition-transform duration-300">
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 20 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="sm:h-[13px] sm:w-[15px]"
                      >
                        <path
                          d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                          fill="#7B7B7B"
                          stroke="#DFDFDF"
                          strokeWidth="0.0488281"
                        />
                      </svg>
                    </span>
                  </button>
                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(item.id);
                    }}
                    className="hover:bg-zik-main/10 ml-1 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 sm:h-8 sm:w-8"
                    aria-label={
                      item.isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                    }
                  >
                    <FaStar
                      className={`h-4 w-4 transition-colors duration-200 ease-in-out sm:h-5 sm:w-5 ${item.isBookmarked ? "text-zik-main" : "text-gray-200"}`}
                      style={{
                        transition: "all 0.3s ease-in-out",
                        transform: item.isBookmarked ? "scale(1.1) rotate(0deg)" : "scale(1) rotate(0deg)",
                      }}
                    />
                  </button>
                </div>
                {/* badge row + 질문 row (모바일 flex-col, 데스크탑 grid) */}
                <div
                  className="flex cursor-pointer flex-col items-center gap-y-2 px-4 py-3 sm:grid sm:grid-cols-12 sm:py-4"
                  onClick={() => toggleOpen(item.id)}
                >
                  {/* badge row */}
                  <div className="flex w-full min-w-0 items-center sm:col-span-4">
                    <span className="text-xs font-bold text-gray-400 sm:text-sm">
                      {page * PAGE_SIZE + idx + 1}
                    </span>
                    {item.job && (
                      <div className="ml-2 w-auto rounded-full px-1 py-0.5 text-center text-xs font-bold whitespace-nowrap text-gray-700 sm:mr-4 sm:ml-12 sm:w-[100px] sm:px-2 sm:py-1 sm:text-base">
                        {item.job}
                      </div>
                    )}
                    {item.type && (
                      <div className="mr-12 w-auto rounded-full px-1 py-0.5 text-center text-xs font-bold text-gray-700 sm:ml-1 sm:w-[160px] sm:px-2 sm:py-1 sm:text-base">
                        {item.type}
                      </div>
                    )}
                  </div>
                  {/* 질문 row */}
                  <div className="mt-1 mr-16 w-auto min-w-0 flex-1 text-sm font-medium break-words whitespace-normal text-gray-900 sm:col-span-8 sm:mt-0 sm:ml-2">
                    {item.question}
                  </div>
                </div>
                {/* 답변 아코디언: 부드러운 애니메이션 적용 */}
                <div
                  className={`overflow-hidden rounded-b-2xl bg-white transition-all ${
                    openIds.includes(item.id)
                      ? "max-h-[2000px] px-4 py-3 opacity-100 duration-500 sm:px-6 sm:py-4"
                      : "max-h-0 px-4 py-0 opacity-0 duration-300 sm:px-6"
                  }`}
                  style={{ 
                    willChange: "max-height, opacity, padding",
                    transitionProperty: "max-height, opacity, padding",
                    transitionTimingFunction: "ease-in-out"
                  }}
                >
                  <div className={`transform transition-transform ${
                    openIds.includes(item.id) ? "translate-y-0 duration-700" : "translate-y-10 duration-500"
                  }`}>
                    {item.answer && (
                      <div className="mb-3 sm:mb-4">
                        <div className="mb-1 text-sm font-medium text-gray-500 sm:mb-2 sm:text-base">
                          내 답변
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 sm:p-4 sm:text-base">
                          {item.answer}
                        </div>
                      </div>
                    )}
                    {item.recommendation && (
                      <div className="mb-3 sm:mb-4">
                        <div className="mb-1 text-sm font-medium text-gray-500 sm:mb-2 sm:text-base">
                          추천 답변
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 sm:p-4 sm:text-base">
                          {item.recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* 로딩 인디케이터 */}
          {loading && (
            <div className="mt-8 mb-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
          
          {/* 스크롤 시 보여줄 "더 많은 콘텐츠 불러오는 중" 메시지 */}
          {hasMore && !loading && visibleResults.length > 0 && (
            <div className="mt-4 mb-8 text-center text-sm text-gray-400">
              스크롤하여 더 많은 북마크를 확인하세요
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
