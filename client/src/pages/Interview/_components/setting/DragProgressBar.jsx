import { useState, useRef, useEffect, useCallback } from "react";
import { useInterviewStore } from "@/store/interviewSetupStore";

const DragProgressBar = () => {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);
  const { ratio, setRatio } = useInterviewStore();
  const [leftValue, setLeftValue] = useState(100 - ratio);
  const justFinishedDragging = useRef(false);

  // 드래그 핸들러
  const handleDragStart = (e) => {
    // 기본 드래그 동작 방지
    e.preventDefault();
    setIsDragging(true);

    // 전체 페이지에서 텍스트 선택 방지
    document.body.style.userSelect = "none";
    document.body.style.cursor = "pointer";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    justFinishedDragging.current = true;

    // 텍스트 선택 및 커서 복원
    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    // 짧은 지연 후 클릭 허용
    setTimeout(() => {
      justFinishedDragging.current = false;
    }, 100);
  };

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !progressBarRef.current) return;

      // 기본 동작 방지
      e.preventDefault();

      const rect = progressBarRef.current.getBoundingClientRect();
      const barWidth = rect.width;
      const offsetX = e.clientX - rect.left;

      // 바에서의 위치를 퍼센트로 계산 (0-100%)
      let percent = Math.round(((offsetX / barWidth) * 100) / 10) * 10;

      // 범위 제한 (0%-100%)
      percent = Math.max(0, Math.min(100, percent));

      setLeftValue(100 - percent);
      setRatio(percent);
    },
    [isDragging, setRatio],
  );

  // 클릭으로 조정 (10% 단위)
  const handleBarClick = (e) => {
    if (!progressBarRef.current || justFinishedDragging.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const barWidth = rect.width;
    const offsetX = e.clientX - rect.left;
    const handlePositionX = (ratio / 100) * barWidth;

    let newRightValue = ratio;

    if (offsetX < handlePositionX) {
      // 핸들 왼쪽 클릭 → 왼쪽으로 10% 감소
      newRightValue = Math.max(0, ratio - 10);
    } else if (offsetX > handlePositionX) {
      // 핸들 오른쪽 클릭 → 오른쪽으로 10% 증가
      newRightValue = Math.min(100, ratio + 10);
    }

    setLeftValue(100 - newRightValue);
    setRatio(newRightValue);
  };

  // 전체 문서에서 마우스 이동 및 릴리스 이벤트를 추적
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleDragEnd);

      // dragstart 이벤트도 방지
      const preventDragStart = (e) => e.preventDefault();
      document.addEventListener("dragstart", preventDragStart);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleDragEnd);
        document.removeEventListener("dragstart", preventDragStart);

        // 정리 시에도 스타일 복원
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div className="mx-auto my-12 w-xl px-4">
      <div className="flex w-full items-center justify-between">
        <div className="w-20 text-center">
          <div className="text-zik-text text-xl font-medium">인성</div>
          <div className="text-zik-main text-2xl font-bold">{leftValue}%</div>
        </div>

        <div
          ref={progressBarRef}
          onClick={handleBarClick}
          className="bg-zik-main/40 relative mx-4 h-2 flex-1 rounded-full"
          style={{
            userSelect: "none",
          }}
        >
          {/* 드래그 핸들 - 원형 */}
          <div
            className={`absolute top-1/2 z-10 -translate-y-1/2 ${
              !isDragging ? "" : "transition-all duration-100 ease-in-out"
            }`}
            style={{ left: `${ratio}%` }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            draggable={false}
          >
            <div
              className={`border-zik-main -ml-4 flex h-6 w-6 items-center justify-center rounded-full border-4 bg-white shadow-md transition-all ${
                isDragging
                  ? "scale-110 cursor-pointer"
                  : "cursor-pointer hover:scale-105"
              }`}
              style={{
                userSelect: "none",
              }}
            ></div>
          </div>

          {/* 컬러 인디케이터 */}
          <div
            className={`bg-zik-main absolute inset-y-0 left-0 rounded-l-full ${
              !isDragging ? "" : "transition-all duration-100 ease-in-out"
            }`}
            style={{ width: `${ratio}%` }}
          ></div>
        </div>

        <div className="w-20 text-center">
          <div className="text-zik-text text-xl font-medium">직무</div>
          <div className="text-zik-main text-2xl font-bold">{ratio}%</div>
        </div>
      </div>
    </div>
  );
};

export default DragProgressBar;
