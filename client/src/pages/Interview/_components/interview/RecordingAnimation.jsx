import React, { useMemo } from "react";
import { motion } from "framer-motion";

const RecordingAnimation = React.memo(() => {
  const bars = useMemo(() => Array.from({ length: 15 }, (_, i) => i));

  const generateRandomHeight = () => Math.floor(Math.random() * 40);

  return (
    <div className="relative my-5 flex h-8 items-center justify-center">
      <div className="absolute flex items-center gap-1">
        {bars.map((_, index) => (
          <motion.div
            key={`bar-${index}`}
            className="bg-zik-border w-[1px] rounded-md"
            animate={{
              height: [
                generateRandomHeight(),
                generateRandomHeight(),
                generateRandomHeight(),
              ],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        ))}
      </div>
      <span className="z-10 font-semibold text-[#FE607D]">녹음 중...</span>
    </div>
  );
});

export default RecordingAnimation;
