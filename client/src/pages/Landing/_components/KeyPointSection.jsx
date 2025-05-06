import React, { useRef } from "react";
import jobQuestion from "@/assets/images/job-question.svg";
import difficultyLevel from "@/assets/images/difficulty-level.svg";
import feedback from "@/assets/images/feedback.svg";
import { motion, useInView } from "framer-motion";

const listWrap =
  "flex flex-1 min-w-0 flex-row justify-start gap-4 md:flex-col items-center md:justify-start";
const imageWrap =
  "w-[clamp(60px,15vw,220px)] h-[clamp(60px,15vw,220px)] bg-[#ECEBFF] rounded-[50%] flex items-center justify-center";
const imageSize = "w-[clamp(30px,8vw,100px)] h-[clamp(30px,8vw,100px)]";
const textWrap =
  "md:mt-7 flex flex-col items-center justify-center flex items-start md:items-center whitespace-nowrap";
const titleStyle = "text-left mb-2 text-[clamp(16px,2vw,24px)]";
const descriptionStyle =
  "text-left text-[clamp(14px,1.5vw,18px)] lg:text-[16px] text-gray-500";

const KeyPointSection = () => {
  const listRef = useRef(null);
  const isListRef = useInView(listRef, {
    once: true,
  });

  return (
    <div className="bg-zik-main/5 relative z-0 flex h-screen flex-col items-center justify-center overflow-hidden pt-[clamp(24px,8.3333vw,80px)] pb-7">
      <div className="flex flex-col justify-center md:mt-7">
        <strong className="text-2xl leading-snug sm:text-3xl md:text-4xl">
          직톡, 면접이 두렵지 않은 이유
        </strong>
        <p className="mb-[clamp(70px,5.5556vw,100px)] text-center text-xl leading-relaxed font-semibold text-[#5D5A88] sm:text-2xl md:text-[32px]">
          직톡은 완벽하게 대비한다!
        </p>
      </div>

      <div className="flex w-full justify-center after:absolute after:top-[60%] after:left-1/2 after:-z-10 after:block after:h-full after:w-[calc(100%+200px)] after:translate-x-[-50%] after:rounded-[50%] after:content-[''] md:after:bg-white lg:after:top-[60%]">
        <ul
          ref={listRef}
          className="flex-start flex flex-col justify-center gap-[clamp(40px,5vw,240px)] md:flex-row"
        >
          <motion.li
            initial={{ opacity: 0, y: 40 }}
            animate={isListRef ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className={listWrap}
          >
            <div
              animate={isListRef && { y: 0, opacity: 1 }}
              className={imageWrap}
            >
              <img
                src={jobQuestion}
                alt="직무 질문 그림"
                className={imageSize}
              />
            </div>
            <div className={textWrap}>
              <strong className={titleStyle}>직무에 적합한 기술 질문</strong>
              <p className={descriptionStyle}>
                실제 직무와 일치하는 맞춤형 질문으로
              </p>
              <p className={descriptionStyle}>면접 대비 효과 극대화</p>
            </div>
          </motion.li>

          <motion.li
            initial={{ opacity: 0, y: 40 }}
            animate={isListRef ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 2 * 0.2 }}
            className={listWrap}
          >
            <div className={imageWrap}>
              <img
                src={difficultyLevel}
                alt="난이도 그림"
                className={imageSize}
              />
            </div>
            <div className={textWrap}>
              <strong className={titleStyle}>난이도 조정 및 꼬리 질문</strong>
              <p className={descriptionStyle}>예상치 못한 꼬리 질문 훈련으로</p>
              <p className={descriptionStyle}>
                실전 면접 상황에서의 대응력 향상
              </p>
            </div>
          </motion.li>

          <motion.li
            initial={{ opacity: 0, y: 40 }}
            animate={isListRef ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 3 * 0.2 }}
            className={listWrap}
          >
            <div className={imageWrap}>
              <img src={feedback} alt="피드백 그림" className={imageSize} />
            </div>
            <div className={textWrap}>
              <strong className={titleStyle}>면접 유형별 피드백</strong>
              <p className={descriptionStyle}>구체적인 피드백으로</p>
              <p className={descriptionStyle}>취업 경쟁력 강화</p>
            </div>
          </motion.li>
        </ul>
      </div>
    </div>
  );
};

export default KeyPointSection;
