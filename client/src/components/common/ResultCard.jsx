import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { RiArrowRightSLine } from "react-icons/ri";

export const ResultCard = ({
  item,
  isDeleteMode,
  selected,
  handleSelectToggle,
  handleBookmarkToggle,
  handleCardClick,
  starredItems,
}) => (
  <div
    className="relative cursor-pointer rounded-md shadow-xl transition-normal duration-1000 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
    onClick={(e) => {
      if (isDeleteMode) {
        e.preventDefault();
        e.stopPropagation();
        handleSelectToggle(item.id);
      } else {
        handleCardClick(item.id, e);
      }
    }}
  >
    {/* 카드 앞면 */}
    <div className="front relative">
      <div className="bg-zik-main/10 flex flex-col rounded-xl p-4 shadow-lg">
        <div className="mb-2 flex w-full items-start justify-between">
          <h3 className="text-zik-text w-4/5 truncate text-base font-semibold sm:text-lg">
            {item.title}
          </h3>
          <ActionButton
            item={item}
            isDeleteMode={isDeleteMode}
            selected={selected}
            handleSelectToggle={handleSelectToggle}
            handleBookmarkToggle={handleBookmarkToggle}
          />
        </div>
        <div className="my-2 flex w-full flex-1 flex-row items-center justify-end pr-4">
          <span className="text-zik-main text-7xl leading-none font-bold sm:text-6xl">
            {item.score}
          </span>
          <span className="text-zik-main ml-2 self-end pb-1 text-sm font-normal sm:text-base">
            score
          </span>
        </div>
        <div className="mt-2 flex w-full items-end justify-between">
          {isDeleteMode ? (
            <span className="text-zik-main flex items-center text-xs transition-colors sm:text-sm">
              more <RiArrowRightSLine size={16} className="ml-0.5" />
            </span>
          ) : (
            <Link
              to={`/interview-result/${item.id}`}
              className="text-zik-main flex items-center text-xs transition-colors sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              more <RiArrowRightSLine size={16} className="ml-0.5" />
            </Link>
          )}
          <span className="text-zik-text/60 text-sm">{item.date}</span>
        </div>
      </div>
    </div>

    {/* 카드 뒷면 */}
    <div className="back absolute inset-0 h-full w-full [transform:rotateY(180deg)] rounded-xl bg-[#B4B1FE] p-4 [backface-visibility:hidden]">
      <div className="flex h-full flex-col justify-between text-left text-[13px]">
        <div>
          <div className="mb-2 flex w-full items-start justify-between">
            <h3 className="w-4/5 truncate text-base font-semibold text-white sm:text-lg">
              {item.title}
            </h3>
            <ActionButton
              item={item}
              isDeleteMode={isDeleteMode}
              selected={selected}
              handleSelectToggle={handleSelectToggle}
              handleBookmarkToggle={handleBookmarkToggle}
              isBackside={true}
            />
          </div>
          <div className="line-clamp-3 pt-3 text-[14px] leading-tight text-white">
            <div>{item.feedback}</div>
          </div>
        </div>
        <div className="mt-2 flex w-full items-end justify-between">
          {isDeleteMode ? (
            <span className="flex items-center text-white transition-colors hover:text-gray-100 sm:text-sm">
              more <RiArrowRightSLine size={16} className="ml-0.5" />
            </span>
          ) : (
            <Link
              to={`/interview-result/${item.id}`}
              className="flex items-center text-white transition-colors hover:text-gray-100 sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              more <RiArrowRightSLine size={16} className="ml-0.5" />
            </Link>
          )}
          <span className="text-sm text-white/70">{item.date}</span>
        </div>
      </div>
    </div>
  </div>
);

export const ActionButton = ({
  item,
  isDeleteMode,
  selected,
  handleSelectToggle,
  handleBookmarkToggle,
  isBackside = false,
}) => {
  if (isDeleteMode) {
    return (
      <input
        type="checkbox"
        checked={!!selected[item.id]}
        onChange={(e) => {
          e.stopPropagation();
          handleSelectToggle(item.id, e);
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={`h-5 w-5 rounded border-gray-300 text-zik-main focus:ring-zik-main accent-zik-main [&:checked]:bg-zik-main [&:checked]:text-white`}
      />
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleBookmarkToggle(item.id, e);
      }}
      className={`hover:text-zik-main ml-1 flex h-5 w-5 items-center justify-center rounded-full text-zik-text transition-colors`}
    >
      <FaStar
        className={`h-5 w-5 transition-all duration-200 ease-in-out ${
          item.bookmarked
            ? "text-zik-main scale-110"
            : "hover:text-zik-main/80 text-zik-text/10"
        }`}
      />
    </button>
  );
};

export const LoadingIndicator = () => (
  <div className="mt-8 flex justify-center">
    <div className="border-zik-main h-10 w-10 animate-spin rounded-full border-t-1 border-b-1"></div>
  </div>
);

export const ScrollGuide = () => (
  <div className="text-zik-text/10 my-4 rounded-lg py-2 text-center text-sm">
    스크롤하여 더 많은 질문을 확인하세요 ▼
  </div>
);

export default {
  ResultCard,
  ActionButton,
  LoadingIndicator,
  ScrollGuide,
}; 