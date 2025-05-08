import React, { useState, useRef, useEffect } from "react";
import FilterDropdown from "@/components/common/FilterDropdown";
import { faqData } from "@/data/faqData";
import { careerData } from "@/data/carrerData";
import { FaStar } from "react-icons/fa";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import EmptyBookmarkList from "./EmptyBookmarkList";
import Pagination from "@/components/common/Pagination";

const jobOptions = [
  { value: "직군·직무", label: "직군·직무" },
  ...careerData.map((cat) => ({
    label: cat.category,
    options: cat.roles.map((role) => ({
      value: role,
      label: role,
    })),
  })),
];
const typeOptions = [
  { value: "전체", label: "전체" },
  { value: "인성", label: "인성" },
  { value: "직무", label: "직무" },
  { value: "즐겨찾기", label: "즐겨찾기" },
  { value: "최신순", label: "최신순" },
];

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
  const [type, setType] = useState("전체");
  const [starredItems, setStarredItems] = useState(getBookmarkedIds());
  const [page, setPage] = useState(1);
  const [isCareerModalOpen, setCareerModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [shouldCloseModal, setShouldCloseModal] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (shouldCloseModal) {
      setCareerModalOpen(false);
      setSelectedCategory(null);
      setSelectedRole(null);
      setShouldCloseModal(false);
    }
  }, [shouldCloseModal]);

  const handleModalClose = () => {
    console.log("handleModalClose called");
    console.log("Before state update - isCareerModalOpen:", isCareerModalOpen);
    setCareerModalOpen(false);
    setSelectedCategory(null);
    setSelectedRole(null);
    console.log("After state update - isCareerModalOpen:", isCareerModalOpen);
  };

  const handleModalOpen = () => {
    setSelectedCategory(null);
    setSelectedRole(null);
    setCareerModalOpen(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedRole(null);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleRoleConfirm = () => {
    console.log("handleRoleConfirm called");
    if (selectedRole) {
      console.log("selectedRole:", selectedRole);
      setJob(selectedRole);
      console.log("job set to:", selectedRole);
      console.log(
        "Before state update - isCareerModalOpen:",
        isCareerModalOpen,
      );
      handleModalClose();
      console.log("After state update - isCareerModalOpen:", isCareerModalOpen);
    }
  };

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

  // 북마크 여부 포함하여 전체 데이터 변환 및 필터링
  const bookmarks = testEmpty
    ? []
    : faqData
        .filter((item) => {
          // 1. 직무(job) 필터링
          const careerMatch = job === "직군·직무" || item.job === job;
          // 2. 기존 type '일반' 제외 필터링
          const typeMatch = item.type !== "일반";
          return careerMatch && typeMatch;
        })
        .map((item) => ({
          ...convertToBookmarkData(item),
          isBookmarked: starredItems.includes(item.id),
        }))
        .sort((a, b) => {
          // 최신순 정렬 (id가 클수록 최신)
          return b.id - a.id;
        });

  // 추가 필터링 (질문 유형 + 즐겨찾기)
  const filtered = bookmarks.filter((item) => {
    if (type === "전체") return true;
    if (type === "즐겨찾기") return starredItems.includes(item.id);
    return item.type === type;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageResults = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-5xl py-8">
      {filtered.length === 0 ? (
        <EmptyBookmarkList
          job={job}
          setJob={setJob}
          type={type}
          setType={setType}
          isCareerModalOpen={isCareerModalOpen}
          setCareerModalOpen={setCareerModalOpen}
        />
      ) : (
        <>
          <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
            질문 북마크
          </h2>
          {/* 필터 영역 */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="relative ml-1 flex w-auto min-w-24 items-center justify-center truncate rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none"
                onClick={handleModalOpen}
                role="listbox"
                aria-haspopup="listbox"
                aria-expanded={isCareerModalOpen}
              >
                {job}
              </button>
              {isCareerModalOpen && (
                <CareerSelectModal
                  isOpen={isOpenModal}
                  onClose={modalHandler}
                />
              )}

              <FilterDropdown
                value={{ type: type }}
                onChange={(v) => {
                  if (v.type === "최신순") {
                    // 최신순 정렬 로직
                    const sortedBookmarks = [...bookmarks].sort(
                      (a, b) => b.id - a.id,
                    );
                    setType("전체");
                  } else {
                    setType(v.type);
                  }
                }}
                options={typeOptions}
                className="relative flex w-auto min-w-12 items-center justify-center truncate rounded-full border border-gray-300 bg-white px-2 py-2.5 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="relative mr-2 ml-1 flex w-auto min-w-12 items-center justify-center truncate rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none"
              onClick={() => {
                setJob("직군·직무");
                setType("전체");
              }}
            >
              초기화
            </button>
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
          {pageResults.map((item, idx) => (
            <div key={item.id} className="mb-3">
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
                    className="hover:bg-zik-main/10 ml-1 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 sm:h-8 sm:w-8"
                    aria-label={
                      item.isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                    }
                  >
                    <FaStar
                      className={`h-4 w-4 transition-colors duration-300 ease-in-out sm:h-5 sm:w-5 ${item.isBookmarked ? "text-zik-main" : "text-gray-200"}`}
                      style={{
                        transform: item.isBookmarked
                          ? "scale(1.2)"
                          : "scale(1)",
                        transition:
                          "transform 0.3s ease-in-out, color 0.3s ease-in-out",
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
                      {(page - 1) * PAGE_SIZE + idx + 1}
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
                {/* 답변 아코디언: FaqItem 스타일로, 글자 크기/색상/여백 동일하게 */}
                <div
                  className={`overflow-hidden rounded-b-2xl bg-white px-4 transition-all duration-300 sm:px-6 ${
                    openIds.includes(item.id)
                      ? "max-h-[1000px] py-3 opacity-100 sm:py-4"
                      : "max-h-0 py-0 opacity-0"
                  }`}
                  style={{ willChange: "max-height, opacity, padding" }}
                >
                  {openIds.includes(item.id) && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default QuestionBookmarkList;
