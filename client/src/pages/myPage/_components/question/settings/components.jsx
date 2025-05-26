import React, { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoCheckmarkSharp } from "react-icons/io5";
import FilterDropdown from "@/components/common/FilterDropdown";
import { ResultCard } from "@/components/common/ResultCard";
import { SORT_OPTIONS } from "@/components/common/useFilter";
import { TEXT_COLORS } from "@/pages/myPage/_components/question/settings/constants";

export const Header = React.memo(({ showDescription = true }) => (
  <>
    <h2 className="text-zik-text mb-6 w-full text-center text-2xl font-bold sm:text-3xl">
      분석 결과 리스트
    </h2>
    {showDescription && (
      <div
        className={`mb-3 text-center text-sm ${TEXT_COLORS.description} sm:text-base`}
      >
        응시한 모의면접 결과를 한눈에 확인하고,
        <br className="hidden md:block" />
        점수와 피드백을 기반으로 부족한 부분을 보완해보세요.
      </div>
    )}
  </>
));

// 애니메이션 버튼 컴포넌트
const AnimatedButton = ({
  onClick,
  className,
  title,
  children,
  animationType = "scale-in",
}) => {
  return (
    <button
      onClick={onClick}
      className={`${className} animate-${animationType} relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg focus:outline-none active:scale-95`}
      title={title}
    >
      {children}
      {/* 내부 글로우 효과 */}
      <span className="animate-ripple absolute inset-0 rounded-full bg-white/20"></span>
      {/* 외부 엣지 효과 */}
      <span className="absolute inset-0 rounded-full opacity-30 shadow-inner"></span>
    </button>
  );
};

export const FilterBar = React.memo(
  ({
    filterValue,
    onFilterChange,
    isDeleteMode,
    onDeleteToggle,
    onDeleteConfirm,
  }) => {
    // 삭제 모드 변경될 때 애니메이션을 위한 상태
    const [showDeleteButton, setShowDeleteButton] = useState(true);
    const [showActionButtons, setShowActionButtons] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);
    const trashButtonRef = useRef(null);

    // 삭제 모드 변경 감지
    useEffect(() => {
      if (isDeleteMode) {
        setShowDeleteButton(false);
        // 조금 지연 후 액션 버튼들 표시 (애니메이션 효과 위함)
        setTimeout(() => setShowActionButtons(true), 100);
      } else {
        setShowActionButtons(false);
        // 조금 지연 후 삭제 버튼 표시 (애니메이션 효과 위함)
        setTimeout(() => setShowDeleteButton(true), 300);
      }
    }, [isDeleteMode]);

    // 쓰레기통 버튼 클릭 핸들러
    const handleTrashButtonClick = (e) => {
      // 플래시 효과 적용
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 500);

      // 약간 지연 후 삭제 모드 토글 (플래시 효과 보이게)
      setTimeout(() => {
        onDeleteToggle(e);
      }, 150);
    };

    return (
      <div className="mx-auto mb-2 flex w-full max-w-5xl flex-row items-center justify-between gap-0">
        <div className="flex w-auto items-center">
          <FilterDropdown
            value={filterValue}
            onChange={onFilterChange}
            options={[
              { value: SORT_OPTIONS.LATEST, label: SORT_OPTIONS.LATEST },
              { value: SORT_OPTIONS.BOOKMARK, label: SORT_OPTIONS.BOOKMARK },
            ]}
          />
        </div>
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 쓰레기통 아이콘 (삭제 모드 아닐 때) */}
            {showDeleteButton && !isDeleteMode && (
              <AnimatedButton
                onClick={handleTrashButtonClick}
                className={`bg-zik-main/10 text-zik-main hover:bg-zik-main/20 z-10 flex h-9 w-9 min-w-9 items-center justify-center rounded-full border border-none shadow-md outline-none focus:outline-none ${isFlashing ? "btn-flash" : ""}`}
                title="삭제 모드"
                animationType="rotate-in"
                ref={trashButtonRef}
              >
                <FaTrash size={16} className="mx-auto" />
              </AnimatedButton>
            )}
          </div>

          {/* 취소/확인 버튼 (삭제 모드일 때) */}
          {showActionButtons && isDeleteMode && (
            <div className="absolute inset-0">
              {/* 트래시 버튼 위치 표시 (애니메이션 시작점) */}
              <div className="absolute top-1/2 left-1/2 z-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2">
                {/* 취소 버튼 (왼쪽으로) */}
                <AnimatedButton
                  onClick={onDeleteToggle}
                  className="absolute z-10 flex h-8 w-8 min-w-8 items-center justify-center rounded-full border border-none bg-gray-300 text-white shadow-lg outline-none hover:bg-gray-400 focus:outline-none"
                  title="취소"
                  animationType="orbit-left"
                >
                  <IoMdClose size={16} className="mx-auto" />
                </AnimatedButton>

                {/* 확인 버튼 (위쪽으로) */}
                <AnimatedButton
                  onClick={onDeleteConfirm}
                  className="bg-zik-main absolute z-10 flex h-8 w-8 min-w-8 items-center justify-center rounded-full border border-none text-white shadow-lg outline-none hover:bg-indigo-600 focus:outline-none"
                  title="삭제 확인"
                  animationType="orbit-right"
                >
                  <IoCheckmarkSharp size={16} className="mx-auto" />
                </AnimatedButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export const ResultGrid = React.memo(
  ({
    visibleResults,
    isDeleteMode,
    selected,
    handleSelectToggle,
    handleBookmarkToggle,
    handleCardClick,
  }) => (
    <div className="grid min-h-[500px] grid-cols-1 sm:grid-cols-2 sm:gap-6 sm:pt-4.5 lg:grid-cols-3">
      {visibleResults.map((item) => (
        <div
          key={item.id}
          className={isDeleteMode ? "" : "group"}
        >
          <ResultCard
            item={item}
            isDeleteMode={isDeleteMode}
            selected={selected}
            handleSelectToggle={handleSelectToggle}
            handleBookmarkToggle={handleBookmarkToggle}
            handleCardClick={handleCardClick}
          />
        </div>
      ))}
    </div>
  ),
);

export const LoadingIndicator = () => (
  <div className="my-6 flex justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export const ScrollPrompt = () => (
  <div
    className={`my-4 rounded-lg py-2 text-center text-sm ${TEXT_COLORS.description}`}
  >
    스크롤하여 더 많은 결과를 확인하세요 ▼
  </div>
);
