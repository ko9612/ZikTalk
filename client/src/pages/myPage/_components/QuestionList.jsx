import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { RiArrowRightSLine } from "react-icons/ri";
import FilterDropdown from "@/components/common/FilterDropdown";
import { Link, Links } from "react-router-dom";

export const initialResults = [
  {
    id: 1,
    title: "백엔드개발자-3",
    score: 75,
    desc: "score",
    date: "2025.04.19",
    more: true,
    recommend: 5,
    views: 100,
  },
  {
    id: 2,
    title: "프론트엔드개발자-1",
    score: 20,
    desc: "score",
    date: "2025.04.19",
    more: true,
    recommend: 2,
    views: 80,
  },
  {
    id: 3,
    title: "백엔드개발자-1",
    score: 90,
    desc: "score",
    date: "2025.04.19",
    more: true,
    recommend: 10,
    views: 200,
  },
  {
    id: 4,
    title: "백엔드개발자-3",
    score: 72,
    desc: "score",
    date: "2025.04.19",
    more: true,
    recommend: 1,
    views: 50,
  },
  {
    id: 5,
    title: "백엔드개발자-2",
    score: 60,
    desc: "score",
    date: "2025.04.19",
    more: true,
    recommend: 3,
    views: 120,
  },
  {
    id: 6,
    title: "백엔드개발자-1",
    score: 65,
    desc: "score",
    date: "2025.04.19",
    more: true,
    recommend: 0,
    views: 30,
  },
  {
    id: 7,
    title: "프론트엔드개발자-2",
    score: 82,
    desc: "score",
    date: "2025.04.18",
    more: true,
    recommend: 7,
    views: 150,
  },
  {
    id: 8,
    title: "모바일개발자-1",
    score: 68,
    desc: "score",
    date: "2025.04.18",
    more: true,
    recommend: 4,
    views: 90,
  },
  {
    id: 9,
    title: "데이터사이언티스트-1",
    score: 88,
    desc: "score",
    date: "2025.04.17",
    more: true,
    recommend: 8,
    views: 180,
  },
  {
    id: 10,
    title: "UI/UX디자이너-1",
    score: 77,
    desc: "score",
    date: "2025.04.17",
    more: true,
    recommend: 6,
    views: 130,
  },
  {
    id: 11,
    title: "클라우드엔지니어-1",
    score: 79,
    desc: "score",
    date: "2025.04.16",
    more: true,
    recommend: 5,
    views: 110,
  },
  {
    id: 12,
    title: "보안전문가-1",
    score: 85,
    desc: "score",
    date: "2025.04.16",
    more: true,
    recommend: 9,
    views: 160,
  },
  {
    id: 13,
    title: "DevOps엔지니어-1",
    score: 73,
    desc: "score",
    date: "2025.04.15",
    more: true,
    recommend: 3,
    views: 95,
  },
  {
    id: 14,
    title: "AI엔지니어-1",
    score: 91,
    desc: "score",
    date: "2025.04.15",
    more: true,
    recommend: 12,
    views: 220,
  },
];

const PAGE_SIZE = 6;

const getBookmarkedIds = () => {
  try {
    return JSON.parse(localStorage.getItem("questionBookmarks")) || [];
  } catch {
    return [];
  }
};
const setBookmarkedIds = (ids) => {
  localStorage.setItem("questionBookmarks", JSON.stringify(ids));
};

const QuestionList = (props) => {
  const [results, setResults] = useState(props.results ?? initialResults);
  const [page, setPage] = useState(0);
  const [visibleResults, setVisibleResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false); // 사용자가 스크롤했는지 추적하는 상태 추가
  const observer = useRef();
  const [starredItems, setStarredItems] = useState(getBookmarkedIds());
  const [filter, setFilter] = useState({ type: "최신순", rating: 0 });
  const [selected, setSelected] = useState({}); // 체크박스 선택 상태
  const [isDeleteMode, setIsDeleteMode] = useState(false); // 삭제 모드 상태 추가

  // ESC 키로 삭제 모드 해제
  useEffect(() => {
    if (!isDeleteMode) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDeleteMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteMode]);

  // 정렬된 데이터 반환
  const getSortedResults = () => {
    let sorted = [...results];

    // 즐겨찾기 필터링
    if (filter.type === "즐겨찾기") {
      sorted = sorted.filter((item) => starredItems.includes(item.id));
    }

    // 정렬
    if (filter.type === "최신순") {
      sorted.sort((a, b) => b.date.localeCompare(a.date));
    } else if (filter.type === "추천수") {
      sorted.sort((a, b) => (b.recommend || 0) - (a.recommend || 0));
    } else if (filter.type === "조회수") {
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return sorted;
  };

  // 마지막 요소 참조 콜백 함수
  const lastResultElementRef = useCallback(
    (node) => {
      // 사용자가 스크롤하지 않았으면 관찰하지 않음
      if (loading || !userScrolled) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && userScrolled) {
            loadMoreResults();
          }
        },
        {
          root: null,
          rootMargin: "0px 0px 50px 0px",
          threshold: 0.5,
        },
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, userScrolled],
  ); // userScrolled를 의존성 배열에 추가

  // 별도의 로딩 트리거 div 생성을 위한 참조
  const loadingTriggerRef = useRef(null);

  // 스크롤 이벤트 처리
  useEffect(() => {
    // 초기 스크롤 위치 저장
    let prevScrollY = window.scrollY;
    let scrolledDown = false;
    let scrollTimeout;
    let isScrollPaused = false;
    let pauseTimeout;

    const handleScroll = () => {
      // 사용자 스크롤 상태를 true로 설정
      if (!userScrolled) {
        setUserScrolled(true);
      }

      // 스크롤 중 일시 정지 상태면 처리하지 않음
      if (isScrollPaused) return;

      // 스크롤 디바운싱 (스크롤 이벤트가 너무 자주 발생하는 것 방지)
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        // 사용자가 아래로 스크롤 했는지 확인
        const currentScrollY = window.scrollY;
        scrolledDown = currentScrollY > prevScrollY;
        prevScrollY = currentScrollY;

        if (
          scrolledDown &&
          window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 10 &&
          Math.abs(currentScrollY - prevScrollY) > 10 &&
          !loading &&
          hasMore
        ) {
          isScrollPaused = true;
          setShowLoadingOverlay(true);
          loadMoreResults();

          clearTimeout(pauseTimeout);
          pauseTimeout = setTimeout(() => {
            isScrollPaused = false;
            setShowLoadingOverlay(false);
          }, 5000);
        }
      }, 4500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [loading, hasMore, userScrolled]);

  // 추가 결과 로드 함수
  const loadMoreResults = () => {
    if (!hasMore || loading) return;

    setLoading(true);

    // 실제 API 호출 대신 지연 시간 추가 (시뮬레이션)
    setTimeout(() => {
      const sortedResults = getSortedResults();
      const nextPageResults = sortedResults.slice(
        (page + 1) * PAGE_SIZE,
        (page + 2) * PAGE_SIZE,
      );

      if (nextPageResults.length === 0) {
        setHasMore(false);
      } else {
        setVisibleResults((prev) => [...prev, ...nextPageResults]);
        setPage((prevPage) => prevPage + 1);
      }

      setLoading(false);
    }, 300); // 로딩 시간 단축
  };

  // 필터 변경 시 데이터 리셋
  useEffect(() => {
    const sortedResults = getSortedResults();
    setVisibleResults(sortedResults.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(sortedResults.length > PAGE_SIZE);
    setUserScrolled(false); // 필터 변경 시 스크롤 상태 초기화
  }, [filter]);

  // 초기 데이터 로드
  useEffect(() => {
    const sortedResults = getSortedResults();
    setVisibleResults(sortedResults.slice(0, PAGE_SIZE));
    setPage(0);
    setHasMore(sortedResults.length > PAGE_SIZE);
    setUserScrolled(false); // 초기 로드 시 스크롤 상태 초기화
  }, [results]);

  const handleBookmarkToggle = (itemId, e) => {
    e.stopPropagation();
    setStarredItems((prev) => {
      let next;
      if (prev.includes(itemId)) {
        next = prev.filter((id) => id !== itemId);
      } else {
        next = [...prev, itemId];
      }
      setBookmarkedIds(next);
      return next;
    });
  };

  // 체크박스 토글
  const handleSelectToggle = (itemId) => {
    setSelected((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // 선택된 카드만 삭제
  const handleDeleteItems = () => {
    if (isDeleteMode) {
      const itemsToKeep = results.filter((item) => !selected[item.id]);
      setResults(itemsToKeep);
      setSelected({});
      setIsDeleteMode(false);
      alert("선택된 카드가 삭제되었습니다.");
    } else {
      setIsDeleteMode(true);
    }
  };

  // 결과 페이지로 이동하는 함수
  const handleGoToResult = (itemId) => {
    console.log(`이동: 결과 페이지 ${itemId}`);
    // 실제 구현 시 아래 주석을 해제하고 적절한 경로로 변경하세요
    // window.location.href = `/result/${itemId}`;
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-2 py-8 sm:px-4">
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 180px;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 1rem;
        }
        .flip-card-front {
          transform: rotateY(0deg);
          z-index: 2;
        }
        .flip-card-back {
          transform: rotateY(180deg);
          z-index: 1;
        }
        .text-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 4.5em;
        }
      `}</style>

      <h2 className="text-zik-text mb-2 text-center text-2xl font-bold sm:text-3xl">
        분석 결과 리스트
      </h2>
      <div className="mb-8 text-center text-sm text-gray-400 sm:text-base">
        응시한 모의면접 결과를 한눈에 확인하고,
        <br className="hidden md:block" />
        점수와 피드백을 기반으로 부족한 부분을 보완해보세요.
      </div>
      <div className="mx-auto mb-8 flex w-full max-w-5xl flex-row items-center justify-between gap-0">
        <div className="flex w-auto items-center">
          <FilterDropdown
            value={filter}
            onChange={setFilter}
            className="h-10"
          />
        </div>
        <button
          onClick={handleDeleteItems}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-[#8C82FF]/10 text-[#8C82FF] shadow-sm hover:bg-[#8C82FF]/20 ${isDeleteMode ? "bg-indigo-100" : ""}`}
          style={{ minWidth: 40 }}
        >
          <FaTrash size={22} className="mx-auto" />
        </button>
      </div>
      {results.length === 0 ? (
        <EmptyQuestionList />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleResults.map((item, index) => (
              <div
                key={item.id}
                ref={
                  index === visibleResults.length - 1
                    ? lastResultElementRef
                    : null
                }
                className="group"
              >
                <div className="relative rounded-md shadow-xl transition-all duration-1000 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div className="front relative">
                    <Link
                      to="/interview-result/1"
                      className="flex flex-col rounded-xl p-4 shadow-lg"
                    >
                      {/* 상단: 제목 + 즐겨찾기/체크박스 버튼 */}
                      <div className="mb-2 flex w-full items-start justify-between">
                        <h3 className="w-4/5 truncate text-sm font-semibold text-gray-800 sm:text-base">
                          {item.title}
                        </h3>
                        {isDeleteMode ? (
                          <input
                            type="checkbox"
                            checked={!!selected[item.id]}
                            onChange={() => handleSelectToggle(item.id)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                          />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 호버 이벤트 버블링 중지
                              handleBookmarkToggle(item.id, e);
                            }}
                            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 transition-colors hover:text-indigo-500"
                          >
                            <FaStar
                              className={`h-4 w-4 transition-all duration-200 ease-in-out ${
                                starredItems.includes(item.id)
                                  ? "scale-110 text-indigo-500"
                                  : "text-gray-300 hover:text-indigo-300"
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      {/* 중앙: 점수 표시 */}
                      <div className="my-2 flex w-full flex-1 flex-row items-center justify-end pr-4">
                        <span className="text-7xl leading-none font-bold text-[#8C82FF] sm:text-6xl">
                          {item.score}
                        </span>
                        <span className="ml-2 self-end pb-1 text-sm font-normal text-[#8C82FF] sm:text-base">
                          score
                        </span>
                      </div>
                      {/* 하단: 더보기 버튼 + 날짜 */}
                      <div className="mt-2 flex w-full items-end justify-between">
                        <button
                          className="flex items-center text-xs text-indigo-500 transition-colors hover:text-indigo-700 sm:text-sm"
                          onClick={() => handleGoToResult(item.id)}
                        >
                          more{" "}
                          <RiArrowRightSLine size={16} className="ml-0.5" />
                        </button>
                        <span className="text-[10px] text-gray-400 sm:text-xs">
                          {item.date}
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="back border-zik-border absolute inset-0 h-full w-full [transform:rotateY(180deg)] rounded-xl border-1 bg-[#8C82FF] p-5 [backface-visibility:hidden]">
                    <div className="flex h-full flex-col justify-between text-left">
                      <div>
                        <div className="mb-2 flex w-full items-start justify-between">
                          <h3 className="w-4/5 truncate text-sm font-semibold text-white sm:text-base">
                            {item.title}
                          </h3>
                          {isDeleteMode ? (
                            <input
                              type="checkbox"
                              checked={!!selected[item.id]}
                              onChange={() => handleSelectToggle(item.id)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                            />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmarkToggle(item.id, e);
                              }}
                              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 transition-colors hover:text-indigo-500"
                            >
                              <FaStar
                                className={`h-4 w-4 transition-all duration-200 ease-in-out ${
                                  starredItems.includes(item.id)
                                    ? "scale-110 text-indigo-500"
                                    : "text-gray-300 hover:text-indigo-300"
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        <div className="text-clamp-3 mb-1 py-1 text-[11px] text-white sm:text-sm">
                          {item.id === 1 && (
                            <p>
                              전반적으로 답변이 부족했습니다. 기술 스택에 대한
                              이해도가 낮아, 전반적으로 설명을 못하셨습니다.
                              프로젝트 경험은 잘 설명하셨습니다. 데이터베이스
                              최적화에 대한 부분은 조금 더 깊이 있는 이해가
                              필요합니다.
                            </p>
                          )}
                          {item.id === 2 && (
                            <p>
                              프론트엔드 개발자 포지션에 대한 답변은 구체적인
                              예시가 부족했습니다. React와 관련된 경험을 조금 더
                              상세하게 설명하면 좋을 것 같습니다. UI/UX에 대한
                              이해는 우수한 편입니다.
                            </p>
                          )}
                          {item.id === 3 && (
                            <p>
                              백엔드 개발자 대한 답변은 탁월했습니다. 시스템
                              아키텍처에 대한 이해도가 높고, 문제 해결 능력이
                              뛰어납니다. 클라우드 환경에서의 경험을 더 강조하면
                              좋을 것 같습니다.
                            </p>
                          )}
                          {item.id === 4 && (
                            <p>
                              질문에 대한 답변은 대체로 좋았습니다. API 설계에
                              대한 이해는 훌륭하지만, 보안 관련 지식을 더
                              보완하면 좋겠습니다. 협업 경험을 더 구체적으로
                              설명하면 도움이 될 것입니다.
                            </p>
                          )}
                          {item.id === 5 && (
                            <p>
                              백엔드 포지션에 대한 답변은 기본 지식은 있으나
                              실무 경험이 부족해 보입니다. 트러블슈팅 경험에
                              대한 설명이 필요하며, 코드 최적화에 대한 이해도를
                              높이면 좋겠습니다.
                            </p>
                          )}
                          {item.id === 6 && (
                            <p>
                              백엔드 포지션에 대한 답변은 개념에 대한 이해는
                              좋으나 구체적인 적용 사례가 부족합니다. 대규모
                              시스템 경험을 더 강조하고 성능 최적화에 대한
                              지식을 보완하면 좋을 것 같습니다.
                            </p>
                          )}
                          {item.id > 6 && (
                            <p>
                              {item.title} 포지션에 대한 답변은 전반적으로
                              좋았습니다. 기술적 이해도가 높고 실무 경험이
                              풍부해 보입니다. 다만 일부 질문에서 구체적인 사례
                              설명이 부족했습니다. 프로젝트 경험을 더 자세히
                              언급하면 좋을 것 같습니다.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex w-full items-end justify-between">
                        <button
                          className="flex items-center text-xs text-white transition-colors hover:text-gray-100 sm:text-sm"
                          onClick={() => handleGoToResult(item.id)}
                        >
                          more{" "}
                          <RiArrowRightSLine size={16} className="ml-0.5" />
                        </button>
                        <span className="text-[10px] text-white sm:text-xs">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-t-1 border-b-1 border-indigo-500"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionList;
