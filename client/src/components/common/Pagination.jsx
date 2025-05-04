import React, { useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import '../css/Pagination.css';

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
    <nav className="flex justify-center items-center mt-[24px] mb-0 gap-[8px] bg-transparent rounded-none shadow-none min-h-[40px] p-0" aria-label="페이지 네비게이션">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-none border-none text-[#5D5A88] rounded-full w-[32px] h-[32px] text-[16px] font-medium cursor-pointer transition-[background_0.15s,_color_0.15s] flex items-center justify-center mx-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-none hover:bg-[#ecebff] hover:text-[#7871FE]"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={18} className="text-[#b0b0b0]" />
      </button>
      <div className="flex items-center gap-[8px]">
        {displayPages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="text-[#b0b0b0] text-[18px] mx-[6px] select-none">...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={
                currentPage === page
                  ? "bg-[#ecebff] text-[#7871FE] rounded-full w-[32px] h-[32px] font-bold text-[16px] shadow-none mx-[2px]"
                  : "bg-none border-none text-[#5D5A88] rounded-full w-[32px] h-[32px] text-[16px] font-medium cursor-pointer transition-[background_0.15s,_color_0.15s] flex items-center justify-center mx-[2px] hover:bg-[#ecebff] hover:text-[#7871FE]"
              }
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-none border-none text-[#5D5A88] rounded-full w-[32px] h-[32px] text-[16px] font-medium cursor-pointer transition-[background_0.15s,_color_0.15s] flex items-center justify-center mx-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-none hover:bg-[#ecebff] hover:text-[#7871FE]"
        aria-label="다음 페이지"
      >
        <ChevronRight size={18} className="text-[#b0b0b0]" />
      </button>
    </nav>
  );
};

export default Pagination;
