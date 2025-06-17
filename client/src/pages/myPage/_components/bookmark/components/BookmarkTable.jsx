import React from "react";
import { LoadingIndicator } from "@/components/common/LoadingIndicator";
import FaqItem from "@/components/common/FaqItem";
import { TableHeader, TEXT_COLORS, PAGE_SIZE } from "../settings";

const BookmarkTable = ({
  visibleResults,
  loading,
  currentPage,
  openIds,
  toggleOpen,
  toggleBookmark,
}) => {
  return (
    <>
      <TableHeader />
      <div className="relative mb-4 h-full min-h-[100px] overflow-y-hidden rounded-lg">
        {loading && visibleResults.length === 0 ? (
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="h-full p-2">
            {visibleResults.map((item, index) => (
              <div key={item.id}>
                <FaqItem
                  id={item.id}
                  displayId={(currentPage - 1) * PAGE_SIZE + index + 1}
                  career={item.career}
                  type={item.type}
                  question={item.question}
                  answer={item.answer}
                  recommendation={item.recommendation}
                  isExpanded={openIds.includes(item.id)}
                  onToggle={() => toggleOpen(item.id)}
                  isStarred={item.bookmarked}
                  onStarToggle={() => toggleBookmark(item.id)}
                  textColors={TEXT_COLORS}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BookmarkTable; 