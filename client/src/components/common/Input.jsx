import React from "react";
import clsx from "clsx";

const Input = ({
  children,
  type = "text",
  name,
  disabled = false,
  labelClassName,
  inputClassName,
  ...attribute
}) => {
  return (
    <label
      className={clsx("text-zik-main flex flex-col font-bold", labelClassName)}
    >
      {children}
      <input
        className={clsx(
          "border-zik-border text-zik-border rounded-[10px] border p-3 text-sm font-medium",
          disabled && "bg-zik-main/20 text-zik-main",
          inputClassName,
        )}
        type={type}
        name={name}
        disabled={disabled}
        {...attribute}
      />
    </label>
  );
};

export default Input;
