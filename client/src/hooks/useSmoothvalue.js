import { useEffect, useState, useRef } from "react";

export const useSmoothValue = (targetValue, speed = 0.02) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const rafRef = useRef(null);
  const prevValue = useRef(displayValue);

  useEffect(() => {
    const animate = () => {
      const diff = targetValue - prevValue.current;
      if (Math.abs(diff) < 0.1) {
        // 차이가 0.1 이하로 줄어들면 targetValue에 바로 도달하도록 설정
        setDisplayValue(targetValue);
        prevValue.current = targetValue;
      } else {
        prevValue.current += diff * speed; // 속도를 아주 부드럽게 설정
        setDisplayValue(prevValue.current);
      }
      rafRef.current = requestAnimationFrame(animate); // 계속 애니메이션 업데이트
    };

    rafRef.current = requestAnimationFrame(animate); // 애니메이션 시작

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current); // 컴포넌트가 unmount 될 때 애니메이션 종료
    };
  }, [targetValue, speed]);

  return displayValue;
};
