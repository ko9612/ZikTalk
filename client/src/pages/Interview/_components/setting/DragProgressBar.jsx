import { useState, useRef, useEffect, useCallback } from "react";

const DragProgressBar = () => {
  const [leftValue, setLeftValue] = useState(30);
  const [rightValue, setRightValue] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);

  // 드래그 핸들러
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const barWidth = rect.width;
      const offsetX = e.clientX - rect.left;

      // 바에서의 위치를 퍼센트로 계산 (0-100%)
      let percent = Math.round(((offsetX / barWidth) * 100) / 10) * 10;
      // let percent = Math.round((offsetX / barWidth) * 100);

      // 범위 제한 (0%-100%)
      percent = Math.max(0, Math.min(100, percent));

      setLeftValue(100 - percent);
      setRightValue(percent);
    },
    [isDragging],
  );

  // 클릭으로 조정 (10% 단위)
  const handleBarClick = (e) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const barWidth = rect.width;
    const offsetX = e.clientX - rect.left;
    const handlePositionX = (rightValue / 100) * barWidth;

    let newRightValue = rightValue;

    if (offsetX < handlePositionX) {
      // 핸들 왼쪽 클릭 → 왼쪽으로 10% 감소
      newRightValue = Math.max(0, rightValue - 10);
    } else if (offsetX > handlePositionX) {
      // 핸들 오른쪽 클릭 → 오른쪽으로 10% 증가
      newRightValue = Math.min(100, rightValue + 10);
    }

    setRightValue(newRightValue);
    setLeftValue(100 - newRightValue);
  };

  // 전체 문서에서 마우스 이동 및 릴리스 이벤트를 추적
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
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
        >
          {/* 투명한 슬라이더 트랙 */}
          {/* <div className="absolute inset-0"></div> */}

          {/* 드래그 핸들 - 원형 */}
          <div
            className="absolute top-1/2 z-10 -translate-y-1/2 transition-all duration-200 ease-in-out"
            style={{ left: `${rightValue}%` }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="border-zik-main -ml-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-4 bg-white shadow-md"></div>
          </div>

          {/* 컬러 인디케이터 */}
          <div
            className="bg-zik-main absolute inset-y-0 left-0 rounded-l-full transition-all duration-200 ease-in-out"
            style={{ width: `${rightValue}%` }}
          ></div>
        </div>

        <div className="w-20 text-center">
          <div className="text-zik-text text-xl font-medium">직무</div>
          <div className="text-zik-main text-2xl font-bold">{rightValue}%</div>
        </div>
      </div>
    </div>
  );
};

export default DragProgressBar;
