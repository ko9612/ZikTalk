import React from "react";
import clsx from "clsx";

// 모양 기준: 버튼 모양
// 1. bar: 긴 바형태 2. pill: 둥근 버튼 3. circle: 원
const shapeClasses = {
  bar: "px-6 py-3 rounded-[10px]",
  pill: "px-6 py-3 rounded-[30px]",
  circle: "w-10 h-10 rounded-full",
};

// 배경색 기준: 배경색/글자색
// 1. violet: 보라/흰 2. lightViolet: 연보라/흰 3. white: 흰/보라 4. gray: 회색/진회색 5. red: 빨강/흰
const colorClasses = {
  violet: "bg-zik-main text-[#fff] hover:bg-[#5f58d6]",
  lightViolet: "bg-[#D0CDFF] text-[#fff] hover:bg-[#BCB8FF]",
  white: "bg-[#fff] text-zik-main border border-zik-main hover:bg-[#F5F4FF]",
  gray: "bg-[#DDDDDD] text-[#6E6E6E] hover:bg-[#c6c6c6]",
  red: "bg-[#FE607D] text-[#fff] hover:bg-[#e64c6b]",
};

const Button = ({
  children,
  shape = "pill",
  color = "violet",
  type = "button",
  disabled = false,
  onClick,
  className,
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex items-center justify-center text-base font-semibold transition duration-200 ease-in-out",
        shapeClasses[shape],
        colorClasses[color],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
export default Button;
