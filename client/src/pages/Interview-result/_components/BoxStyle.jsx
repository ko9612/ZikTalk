import Graph from "@/components/common/Graph";
import React from "react";
import clsx from "clsx";

const boxStyle = "flex flex-col border-zik-border rounded-[30px] border p-6";
const titleStyle = "font-bold text-base md:text-lg mb-4";
const scoreBigStyle =
  "text-zik-main mb-4 text-center text-5xl font-bold sm:text-7xl md:text-[80px]";
const scoreSmallStyle =
  "text-zik-main mb-4 text-left text-xl font-bold sm:text-2xl md:text-3xl";

const BoxStyle = ({
  children,
  type = "text", // text - 글 / score - 점수, 글 / graph - 그래프, 점수 , 글
  title = "", // 박스 제목
  score = "", // 점수
  graphState = "", // 그래프 점수
  graphColor, // 그래프 색
  graphStrokeWidth, // 그래프 두께
  className,
}) => {
  return (
    <div type={type} className={clsx("text-zik-text", className)}>
      <div
        className={clsx(
          boxStyle,
          { "flex items-center justify-center": title === "" },
          "h-full",
        )}
      >
        <div className={titleStyle}>{title}</div>
        <div className={clsx({ hidden: type !== "text" }, "overflow-y-auto")}>
          {children}
        </div>
        <div className="relative items-center gap-4 sm:flex">
          <Graph
            text={graphState}
            strokeWidth={graphStrokeWidth}
            value={score}
            color={graphColor}
            className={clsx(
              { hidden: type !== "graph" },
              "mb-4 flex items-center justify-center sm:mb-0",
            )}
          />
          <div className={clsx({ hidden: type === "text" })}>
            <div
              className={clsx(
                type === "score"
                  ? scoreBigStyle
                  : [
                      scoreSmallStyle,
                      "absolute top-[120px] left-[150px] sm:static",
                    ],
              )}
              style={type !== "score" ? { left: "calc(50% + 72px)" } : {}}
            >
              {score}
              <span className="text-sm font-bold sm:text-base">점</span>
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxStyle;
