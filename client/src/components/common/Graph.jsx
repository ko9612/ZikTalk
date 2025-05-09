import React from "react";

const Graph = ({
  text = "",
  value = 75, // 값 (%)
  size = 150, // 전체 크기
  strokeWidth = 10, // 도넛 굵기
  color = "var(--color-zik-main)",
  className,
}) => {
  const radius = (size - strokeWidth) / 2; // 반지름
  const circumference = 2 * Math.PI * radius; // 둘레
  const offset = circumference * (1 - value / 100);

  return (
    <div className={className}>
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-zik-border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.2}
          fill={color}
          fontWeight="bold"
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default Graph;
