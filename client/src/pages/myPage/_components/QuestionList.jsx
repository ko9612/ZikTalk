import React, { useState, useEffect } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { RiArrowRightSLine } from "react-icons/ri";
import FilterDropdown from "@/components/common/FilterDropdown";

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
];

const PAGE_SIZE = 6;

const getBookmarkedIds = () => {
  try {
    return JSON.parse(localStorage.getItem('questionBookmarks')) || [];
  } catch {
    return [];
  }
};
const setBookmarkedIds = (ids) => {
  localStorage.setItem('questionBookmarks', JSON.stringify(ids));
};

const QuestionList = (props) => {
  const [results, setResults] = useState(props.results ?? initialResults);
  const [page, setPage] = useState(0);
  const [starredItems, setStarredItems] = useState(getBookmarkedIds());
  const [filter, setFilter] = useState({ type: "최신순", rating: 0 });
  const [selected, setSelected] = useState({}); // 체크박스 선택 상태
  const [isDeleteMode, setIsDeleteMode] = useState(false); // 삭제 모드 상태 추가

  // ESC 키로 삭제 모드 해제
  useEffect(() => {
    if (!isDeleteMode) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDeleteMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleteMode]);

  // 정렬된 데이터 반환
  const getSortedResults = () => {
    let sorted = [...results];
    
    // 즐겨찾기 필터링
    if (filter.type === "즐겨찾기") {
      sorted = sorted.filter(item => starredItems.includes(item.id));
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

  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

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
      const itemsToKeep = results.filter(item => !selected[item.id]);
      setResults(itemsToKeep);
      setSelected({});
      setIsDeleteMode(false);
      alert("선택된 카드가 삭제되었습니다.");
    } else {
      setIsDeleteMode(true);
    }
  };

  // 정렬 후 페이지네이션
  const sortedResults = getSortedResults();
  const pageResults = sortedResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2 sm:px-4">
      <style>{`
        .perspective {
          perspective: 1500px;
        }
        .flip-card-inner {
          transition: transform 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95);
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          position: relative;
          width: 100%;
          height: 100%;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          transition: box-shadow 0.3s ease;
        }
        .flip-card-front {
          transform: rotateY(0deg);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .flip-card-back {
          transform: rotateY(180deg);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .flip-card:hover .flip-card-front,
        .flip-card:hover .flip-card-back {
          box-shadow: 2px 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .flip-card-front, .flip-card-back {
          box-shadow: 0 6px 24px 0 rgba(60, 60, 120, 0.13), 0 1.5px 6px 0 rgba(60, 60, 120, 0.10);
          transition: box-shadow 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .flip-card:hover .flip-card-front, .flip-card:hover .flip-card-back {
          box-shadow: 0 12px 32px 0 rgba(60, 60, 120, 0.18), 0 3px 12px 0 rgba(60, 60, 120, 0.13);
        }
      `}</style>

      <h2 className="mb-2 text-center text-zik-text text-2xl sm:text-3xl font-bold text-gray-700">
        분석 결과 리스트
      </h2>
      <div className="mb-8 text-center text-sm sm:text-base text-gray-400">
        응시한 모의면접 결과를 한눈에 확인하고,
        <br className="hidden md:block" />
        점수와 피드백을 기반으로 부족한 부분을 보완해보세요.
      </div>
      <div className="mb-8 flex flex-row items-center justify-between w-full max-w-5xl mx-auto gap-0">
        <div className="flex items-center w-auto">
          <FilterDropdown value={filter} onChange={setFilter} className="h-10" />
        </div>
        <button
          onClick={handleDeleteItems}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-[#8C82FF]/10 text-[#8C82FF] hover:bg-[#8C82FF]/20 shadow-sm ${isDeleteMode ? 'bg-indigo-100' : ''}`}
          style={{ minWidth: 40 }}
        >
          <FaTrash size={22} className="mx-auto" />
        </button>
      </div>
      {results.length === 0 ? (
        <EmptyQuestionList />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pageResults.map((item) => (
              <div
                key={item.id}
                className="flip-card perspective relative h-full min-h-[180px] flex group"
                style={{ minHeight: 180 }}
              >
                <div className="flip-card-inner h-full w-full min-h-[180px] flex-1">
                  <div className="flip-card-front flex flex-col p-4 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl bg-white">
                    {/* 상단: 제목 + 즐겨찾기/체크박스 버튼 */}
                    <div className="flex w-full items-start justify-between mb-2">
                      <h3 className="w-4/5 truncate text-sm sm:text-base font-semibold text-gray-800">
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
                          onClick={(e) => handleBookmarkToggle(item.id, e)}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:text-indigo-500 transition-colors"
                        >
                          <FaStar
                            className={`h-4 w-4 transition-all duration-200 ease-in-out ${
                              starredItems.includes(item.id)
                                ? "scale-110 text-indigo-500"
                                : "text-gray-300 group-hover:text-indigo-300"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {/* 중앙: 점수 표시 */}
                    <div className="flex flex-1 flex-row items-center justify-end w-full my-2 pr-4">
                      <span className="text-7xl sm:text-6xl font-bold text-[#8C82FF] leading-none">
                        {item.score}
                      </span>
                      <span className="ml-2 text-sm sm:text-base text-[#8C82FF] font-normal self-end pb-1">
                        score
                      </span>
                    </div>
                    {/* 하단: 더보기 버튼 + 날짜 */}
                    <div className="flex w-full items-end justify-between mt-2">
                      <button className="flex items-center text-xs sm:text-sm text-indigo-500 hover:text-indigo-700 transition-colors">
                        more <RiArrowRightSLine size={16} className="ml-0.5" />
                      </button>
                      <span className="text-[10px] sm:text-xs text-gray-400">{item.date}</span>
                    </div>
                  </div>
                  <div className="flip-card-back flex flex-col justify-between bg-indigo-100 p-4 rounded-xl shadow-lg text-gray-700 min-h-[180px] max-h-[320px] overflow-y-auto">
                    {/* 상단: 즐겨찾기/체크박스 버튼과 제목 */}
                    <div className="flex w-full items-start justify-between mb-2">
                      <h3 className="w-4/5 truncate text-sm sm:text-base font-semibold text-gray-800">
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
                          onClick={(e) => handleBookmarkToggle(item.id, e)}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:text-indigo-500 transition-colors"
                        >
                          <FaStar
                            className={`h-4 w-4 transition-all duration-200 ease-in-out ${
                              starredItems.includes(item.id)
                                ? "scale-110 text-indigo-500"
                                : "text-gray-300 group-hover:text-indigo-300"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {/* 상세 설명 */}
                    <div className="mb-1 text-sm sm:text-base line-clamp-4">
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
                          대한 이해는 훌륭하지만, 보안 관련 지식을 더 보완하면
                          좋겠습니다. 협업 경험을 더 구체적으로 설명하면
                          도움이 될 것입니다.
                        </p>
                      )}
                      {item.id === 5 && (
                        <p>
                          백엔드 포지션에 대한 답변은 기본 지식은 있으나 실무
                          경험이 부족해 보입니다. 트러블슈팅 경험에 대한
                          설명이 필요하며, 코드 최적화에 대한 이해도를 높이면
                          좋겠습니다.
                        </p>
                      )}
                      {item.id === 6 && (
                        <p>
                          백엔드 포지션에 대한 답변은 개념에 대한 이해는
                          좋으나 구체적인 적용 사례가 부족합니다. 대규모
                          시스템 경험을 더 강조하고 성능 최적화에 대한 지식을
                          보완하면 좋을 것 같습니다.
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex items-end justify-between w-full">
                      <span className="text-xs sm:text-sm text-indigo-400">
                        <button className="flex items-center text-xs sm:text-sm text-indigo-500 hover:text-indigo-700 transition-colors">
                          more <RiArrowRightSLine size={16} className="ml-0.5" />
                        </button>
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-300">{item.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length > PAGE_SIZE && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                disabled={page === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl text-indigo-400 disabled:opacity-30 hover:bg-gray-100 transition-colors"
              >
                ◀
              </button>
              <span className="text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl text-indigo-400 disabled:opacity-30 hover:bg-gray-100 transition-colors"
              >
                ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionList;
