import React, { useState, useRef, useEffect } from "react";

const StarRating = ({ rating, onRatingChange }) => {
  const handleStarClick = (starValue) => {
    onRatingChange(starValue);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-2xl select-none ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => handleStarClick(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const FilterDropdown = ({
  value = { type: "최신순", rating: 0 },
  onChange,
  options = [],
  label,
}) => {
  // 드롭다운 열림/닫힘 상태 관리
  const [open, setOpen] = useState(false);
  // 드롭다운 컴포넌트의 DOM 요소 참조를 위한 ref
  const ref = useRef(null);

  // value가 null이면 '최신순'을 기본값으로 사용
  const displayValue =
    !value || !value.type ? { type: "최신순", rating: 0 } : value;

  // 외부 클릭 감지를 위한 이벤트 리스너 설정
  useEffect(() => {
    // 드롭다운 외부 클릭 시 드롭다운을 닫는 함수
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // 마우스 클릭 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 옵션 선택 시 실행되는 함수
  const handleSelect = (val) => {
    if (val === "별") {
      onChange({ type: "별", rating: value.rating });
    } else {
      onChange({ type: val, rating: 0 });
      setOpen(false);
    }
  };

  const handleStarRatingChange = (rating) => {
    onChange({ type: "별", rating });
  };

  // 옵션 목록을 props로 받음, 없으면 기본값 사용
  const optionList = options.length > 0 ? options : [
    { value: "최신순", label: "최신순" },
    { value: "즐겨찾기", label: "즐겨찾기" },
    { value: "조회수", label: "조회수" },
  ];

  return (
    <div className="relative w-48" ref={ref}>
      {label && <div className="mb-1 ml-1 text-xs text-gray-500">{label}</div>}
      {/* 드롭다운 토글 버튼 */}
      <button
        type="button"
        className={`flex items-center justify-between rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none ${open ? "ring-zik-main ring-2" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox" // 접근성: 팝업 목록이 있음을 표시
        aria-expanded={open} // 접근성: 현재 드롭다운 상태 표시
      >
        {displayValue.type} {/* 현재 선택된 값 표시 */}
        <span
          className={`ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 20 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
              fill="#7B7B7B"
              stroke="#DFDFDF"
              stroke-width="0.0488281"
            />
          </svg>
        </span>
      </button>
<<<<<<< Updated upstream
      {/* 드롭다운이 열려있을 때만 옵션 목록 표시 */}
      {open && (
        <div
          className="animate-fadeIn absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="max-h-60 overflow-auto py-1" role="listbox">
            {" "}
            {/* 접근성: 목록 역할 지정 */}
            {/* 옵션 목록을 순회하며 각 항목 렌더링 */}
            {options.map((opt) => (
              <li
                key={opt.value} // React 리스트 렌더링을 위한 고유 키
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${
                  displayValue.type === opt.value
                    ? "text-zik-main bg-gray-50 font-medium"
                    : "text-gray-700"
                }`}
                role="option" // 접근성: 옵션 역할 지정
                aria-selected={displayValue.type === opt.value} // 접근성: 현재 선택된 항목 표시
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  handleSelect(opt.value);
                }} // 클릭 시 해당 옵션 선택
              >
                {opt.label} {/* 옵션 텍스트 표시 */}
                {opt.value === "별" && displayValue.type === "별" && (
                  <div
                    className="mt-2"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <StarRating
                      rating={displayValue.rating}
                      onRatingChange={handleStarRatingChange}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
=======
      {/* 드롭다운 옵션 목록 - 애니메이션 적용 */}
      <div
        className={`absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          open
            ? "max-h-60 scale-100 transform opacity-100"
            : "pointer-events-none max-h-0 scale-95 transform opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="py-1" role="listbox">
          {optionList.map((opt) =>
            opt.options ? (
              <React.Fragment key={opt.label}>
                <li className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 cursor-default select-none">{opt.label}</li>
                {opt.options.map((role) => (
            <li
                    key={role.value}
                    className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-100 ${
                      displayValue.type === role.value
                        ? "text-zik-main bg-gray-50 font-medium"
                        : "text-gray-700"
                    }`}
                    role="option"
                    aria-selected={displayValue.type === role.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(role.value);
                    }}
                  >
                    {role.label}
                  </li>
                ))}
              </React.Fragment>
            ) : (
              <li
                key={opt.value}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-100 ${
                displayValue.type === opt.value
                  ? "text-zik-main bg-gray-50 font-medium"
                  : "text-gray-700"
              }`}
                role="option"
                aria-selected={displayValue.type === opt.value}
              onClick={(e) => {
                  e.stopPropagation();
                handleSelect(opt.value);
                }}
            >
                {opt.label}
              {opt.value === "별" && displayValue.type === "별" && (
                <div
                  className="mt-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <StarRating
                    rating={displayValue.rating}
                    onRatingChange={handleStarRatingChange}
                  />
                </div>
              )}
            </li>
            )
          )}
        </ul>
      </div>
>>>>>>> Stashed changes
    </div>
  );
};

export default FilterDropdown;
