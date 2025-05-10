import React, { useState, useRef, useEffect } from "react";
import { FaStar } from "react-icons/fa";

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
  value = "최신순",
  onChange,
  options = [
    { value: "최신순", label: "최신순" },
    { value: "즐겨찾기", label: "즐겨찾기" },
  ],
  className = "",
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const ref = useRef(null);

  const getSelectedLabel = () => {
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : value;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const hasStarOption = options.some((opt) => opt.value === "별");

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className={`border-zik-border text-zik-text hover:bg-zik-border/10 flex w-36 items-center justify-between rounded-full border bg-white px-3 py-2 text-sm font-medium focus:outline-none ${open ? "ring-zik-main ring-2" : ""} overflow-hidden text-ellipsis whitespace-nowrap`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...props}
      >
        {getSelectedLabel()}
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
              strokeWidth="0.0488281"
            />
          </svg>
        </span>
      </button>
      <div
        className={`absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          open
            ? "max-h-60 scale-100 transform opacity-100"
            : "pointer-events-none max-h-0 scale-95 transform opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="py-1" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-100 ${
                value === opt.value
                  ? "text-zik-main bg-gray-50 font-medium"
                  : "text-gray-700"
              }`}
              role="option"
              aria-selected={value === opt.value}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(opt.value);
              }}
            >
              {opt.label}
              {opt.value === "별" && value === "별" && (
                <div
                  className="mt-2"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <StarRating
                    rating={rating}
                    onRatingChange={(newRating) => {
                      setRating(newRating);
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FilterDropdown;
