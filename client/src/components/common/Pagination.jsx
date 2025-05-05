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
    [onPageChange, totalPages]
  );

  return (
    <nav className="flex justify-center items-center py-6 bg-white" aria-label="페이지 네비게이션">
      {/* Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all duration-200 select-none
          ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-[#7871FE] hover:bg-[#ecebff]"}
        `}
        aria-label="이전 페이지"
      >
        <span className="text-lg">&lt;</span>
        <span>Previous</span>
      </button>
      {/* Page Numbers */}
      <div className="flex items-center gap-2 px-4">
        {displayPages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="text-gray-400 text-lg mx-1.5 select-none">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-base font-medium transition-all duration-200
                ${currentPage === page
                  ? "bg-[#ecebff] text-[#7871FE]"
                  : "text-gray-500 hover:bg-gray-100"}
              `}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>
      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all duration-200 select-none
          ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-[#7871FE] hover:bg-[#ecebff]"}
        `}
        aria-label="다음 페이지"
      >
        <span>Next</span>
        <span className="text-lg">&gt;</span>
      </button>
    </nav>
  );
};

export default Pagination;
