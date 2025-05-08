import { useEffect, useState, useRef } from "react";

export const useSmoothValue = (targetValue, speed = 0.02) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const rafRef = useRef(null);
  const prevValue = useRef(displayValue);

  useEffect(() => {
    const animate = () => {
      const diff = targetValue - prevValue.current;
      if (Math.abs(diff) < 0.1) {
        setDisplayValue(targetValue);
        prevValue.current = targetValue;
      } else {
        prevValue.current += diff * speed;
        setDisplayValue(prevValue.current);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, speed]);

  return displayValue;
};
