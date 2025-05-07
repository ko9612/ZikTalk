import React from "react";

const AnalysisComplete = () => {
  return (
    <i className="border-zik-main/50 flex h-14 w-14 items-center justify-center rounded-full border-2">
      <svg
        width="50"
        height="50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
      >
        <polyline
          className="stroke-draw-check"
          stroke="oklch(0.63 0.2032 281.04)"
          points="14,27 22,34 36,16"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </i>
  );
};

export default AnalysisComplete;
