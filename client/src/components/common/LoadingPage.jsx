import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const letters = "LOADING".split("");

const letterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.3 },
  }),
  exit: (i) => ({
    opacity: 0,
    y: 20,
    transition: { delay: i * 0.12, duration: 0.3 },
  }),
};

const LoadingAnimation = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const appearDuration = (letters.length - 1) * 120 + 300 + 1000;
    const disappearDuration = letters.length * 120 + 500;
    const timer = setTimeout(
      () => setShow((prev) => !prev),
      show ? appearDuration : disappearDuration,
    );
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="text-zik-main flex text-3xl font-bold tracking-widest sm:text-4xl md:text-6xl">
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
  <div className="flex h-full items-center justify-center bg-white">
    <LoadingAnimation />
  </div>
);

export default LoadingPage;
