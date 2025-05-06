import React, { useMemo, useCallback } from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = useMemo(() => {
    const result = [];
    for (let i = 1; i <= totalPages; i++) {
      result.push(i);
    }
    return result;
  }, [totalPages]);

  const displayPages = useMemo(() => {
    if (totalPages <= 7) return pages;
    if (currentPage <= 3) {
      return [...pages.slice(0, 5), "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", ...pages.slice(totalPages - 5)];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }, [currentPage, totalPages, pages]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    },
    [onPageChange, totalPages],
  );

  return (
    <nav
      className="flex items-center justify-center bg-white py-4 sm:py-6"
      aria-label="페이지 네비게이션"
    >
      {/* Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-0.5 rounded-full px-2 py-1.5 text-sm font-medium transition-all duration-200 select-none sm:gap-1 sm:px-4 sm:py-2 sm:text-base ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#7871FE] hover:bg-[#ecebff]"} `}
        aria-label="이전 페이지"
      >
        <span className="text-base sm:text-lg">&lt;</span>
        <span className="hidden sm:inline">Previous</span>
      </button>
      {/* Page Numbers */}
      <div className="flex items-center gap-1 px-2 sm:gap-2 sm:px-4">
        {displayPages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="mx-0.5 text-base text-gray-400 select-none sm:mx-1.5 sm:text-lg"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 sm:h-10 sm:w-10 sm:text-base ${
                currentPage === page
                  ? "bg-[#ecebff] text-[#7871FE]"
                  : "text-gray-500 hover:bg-gray-100"
              } `}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>
      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-0.5 rounded-full px-2 py-1.5 text-sm font-medium transition-all duration-200 select-none sm:gap-1 sm:px-4 sm:py-2 sm:text-base ${currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#7871FE] hover:bg-[#ecebff]"} `}
        aria-label="다음 페이지"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="text-base sm:text-lg">&gt;</span>
      </button>
    </nav>
  );
};

export default Pagination;
