import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { RiArrowRightSLine } from 'react-icons/ri';

export const ResultCard = ({
  item,
  isDeleteMode,
  selected,
  handleSelectToggle,
  handleBookmarkToggle,
  handleCardClick,
  starredItems
}) => (
  <div
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
    className="relative rounded-md shadow-xl transition-normal duration-1000 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
    onClick={(e) => handleCardClick(item.id, e)}
    style={{ cursor: 'pointer' }}
=======
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
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
  >
    {/* 카드 앞면 */}
    <div className="front relative">
      <div className="flex flex-col rounded-xl p-4 bg-zik-main/10 shadow-lg">
        <div className="mb-2 flex w-full items-start justify-between">
          <h3 className="w-4/5 truncate text-sm font-semibold text-gray-500 sm:text-base">
            {item.title}
          </h3>
          <ActionButton 
            item={item} 
            isDeleteMode={isDeleteMode} 
            selected={selected} 
            handleSelectToggle={handleSelectToggle} 
            handleBookmarkToggle={handleBookmarkToggle} 
            starredItems={starredItems} 
          />
        </div>
        <div className="my-2 flex w-full flex-1 flex-row items-center justify-end pr-4">
          <span className="text-7xl leading-none font-bold text-[#8C82FF] sm:text-6xl">
            {item.score}
          </span>
          <span className="ml-2 self-end pb-1 text-sm font-normal text-[#8C82FF] sm:text-base">
            score
          </span>
        </div>
        <div className="mt-2 flex w-full items-end justify-between">
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
          <Link
            to={`/interview-result/${item.id}`}
            className="flex items-center text-xs text-indigo-500 transition-colors hover:text-indigo-700 sm:text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            more <RiArrowRightSLine size={16} className="ml-0.5" />
          </Link>
          <span className="text-[10px] text-gray-400 sm:text-xs">
            {item.date}
          </span>
=======
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
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
        </div>
      </div>
    </div>

    {/* 카드 뒷면 */}
    <div className="back border-zik-border absolute inset-0 h-full w-full [transform:rotateY(180deg)] rounded-xl border-1 bg-[#8C82FF] p-4 [backface-visibility:hidden]">
      <div className="flex h-full flex-col justify-between text-left text-[13px]">
        <div>
          <div className="mb-2 flex w-full items-start justify-between">
            <h3 className="w-4/5 truncate font-semibold text-white sm:text-sm">
              {item.title}
            </h3>
            <ActionButton 
              item={item} 
              isDeleteMode={isDeleteMode} 
              selected={selected} 
              handleSelectToggle={handleSelectToggle} 
              handleBookmarkToggle={handleBookmarkToggle} 
              starredItems={starredItems} 
              isBackside={true}
            />
          </div>
          <div className="mt-2 text-[14px] text-white line-clamp-3 leading-tight">
            <div>{item.feedback}</div>
          </div>
        </div>
        <div className="mt-2 flex w-full items-end justify-between">
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
          <Link
            to={`/interview-result/${item.id}`}
            className="flex items-center text-white transition-colors hover:text-gray-100 sm:text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            more <RiArrowRightSLine size={14} className="ml-0.5" />
          </Link>
          <span className="text-[8px] text-white/70 sm:text-[10px]">
            {item.date}
          </span>
=======
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
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
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
  starredItems, 
  isBackside = false 
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
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
        className={`${isBackside ? 'h-4 w-4' : 'h-5 w-5'} rounded border-gray-300 text-indigo-500 focus:ring-indigo-500`}
=======
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={`h-5 w-5 rounded border-gray-300 text-zik-main focus:ring-zik-main accent-zik-main [&:checked]:bg-zik-main [&:checked]:text-white`}
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
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
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
      className={`ml-1 flex ${isBackside ? 'h-5 w-5' : 'h-6 w-6'} items-center justify-center rounded-full text-gray-300 transition-colors hover:text-indigo-500`}
=======
      className={`hover:text-zik-main ml-1 flex h-5 w-5 items-center justify-center rounded-full text-zik-text transition-colors`}
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
    >
      <FaStar
        className={`${isBackside ? 'h-5 w-5' : 'h-5 w-5'} transition-all duration-200 ease-in-out ${
          starredItems.includes(String(item.id))
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
            ? "scale-110 text-indigo-500"
            : "text-gray-300 hover:text-indigo-300"
=======
            ? "text-zik-main scale-110"
            : "hover:text-zik-main/80 text-zik-text/10"
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
        }`}
      />
    </button>
  );
};

export const LoadingIndicator = () => (
  <div className="mt-8 flex justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-t-1 border-b-1 border-indigo-500"></div>
  </div>
);

export const ScrollGuide = () => (
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
  <div className="my-4 text-center text-sm text-gray-400 py-2 rounded-lg">
=======
  <div className="text-zik-text/10 my-4 rounded-lg py-2 text-center text-sm">
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
    스크롤하여 더 많은 질문을 확인하세요 ▼
  </div>
);

export default {
  ResultCard,
  ActionButton,
  LoadingIndicator,
<<<<<<< Updated upstream:client/src/pages/myPage/_components/common/ResultCard.jsx
  ScrollGuide
=======
  ScrollGuide,
>>>>>>> Stashed changes:client/src/components/common/ResultCard.jsx
}; 