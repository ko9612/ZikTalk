import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const letters = "LOADING".split("");

const letterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.3 }
  }),
  exit: (i) => ({
    opacity: 0,
    y: 20,
    transition: { delay: i * 0.12, duration: 0.3 }
  }),
};

const LoadingAnimation = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // 등장: 마지막 글자까지 등장 + 유지시간(0.5초) 후 사라짐
    const appearDuration = (letters.length - 1) * 120 + 300 + 1000; // ms
    // 사라짐: 마지막 글자부터 첫 글자까지 사라지는 시간
    const disappearDuration = letters.length * 120 + 500;
    const timer = setTimeout(() => setShow((prev) => !prev), show ? appearDuration : disappearDuration);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div className="flex flex-col items-center justify-center h-64 w-full max-w-xs sm:max-w-md">
      <div className="flex text-3xl sm:text-5xl md:text-7xl font-bold tracking-widest text-zik-main">
        <AnimatePresence>
          {show &&
            letters.map((char, i) => (
              <motion.span
                key={char + show}
                custom={i}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={letterVariants}
                className="mx-1"
              >
                {char}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const LoadingPage = () => (
  <div className="flex flex-col justify-between items-center bg-white py-45">
    <main className="flex-1 flex flex-col justify-center items-center">
      <LoadingAnimation />
    </main>
  </div>
);

export default LoadingPage; 