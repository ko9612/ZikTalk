import React from "react";

const LoadingIcon = () => {
  return (
    <div className="flex space-x-2">
      <span className="dot-bounce" style={{ animationDelay: "0s" }}></span>
      <span className="dot-bounce" style={{ animationDelay: "0.15s" }}></span>
      <span className="dot-bounce" style={{ animationDelay: "0.3s" }}></span>
    </div>
  );
};

export default LoadingIcon;
