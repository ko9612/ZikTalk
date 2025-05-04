import React from "react";
import jobQuestion from "@/assets/images/job-question.svg";
import difficultyLevel from "@/assets/images/difficulty-level.svg";
import feedback from "@/assets/images/feedback.svg";

const imageStyle =
  "w-[220px] h-[220px] bg-[#ECEBFF] rounded-[50%] flex items-center justify-center";
const textStyle = "mt-7 flex flex-col items-center justify-center";
const titleStyle = "mb-2 text-xl";
const descriptionStyle = "text-sm text-gray-500";

const KeyPointSection = () => {
  return (
    <div className="bg-zik-main/5 relative z-0 flex flex-col items-center justify-center overflow-hidden pt-[120px] pb-7">
      <div>
        <strong className="text-3xl leading-snug">
          직톡, 면접이 두렵지 않은 이유
        </strong>
        <p className="mb-[80px] text-center text-2xl leading-relaxed font-semibold text-[#5D5A88]">
          직톡은 완벽하게 대비한다!
        </p>
      </div>

      <div className="w-full after:absolute after:top-[400px] after:left-1/2 after:-z-10 after:block after:h-full after:w-[calc(100%+200px)] after:translate-x-[-50%] after:rounded-[50%] after:bg-white after:content-['']">
        <ul className="flex justify-center gap-30">
          <li>
            <div className={imageStyle}>
              <img src={jobQuestion} alt="직무 질문 그림" />
            </div>
            <div className={textStyle}>
              <strong className={titleStyle}>직무에 적합한 기술 질문</strong>
              <p className={descriptionStyle}>
                실제 직무와 일치하는 맞춤형 질문으로
              </p>
              <p className={descriptionStyle}>면접 대비 효과 극대화</p>
            </div>
          </li>

          <li>
            <div className={imageStyle}>
              <img src={difficultyLevel} alt="난이도 그림" />
            </div>
            <div className={textStyle}>
              <strong className={titleStyle}>난이도 조정 및 꼬리 질문</strong>
              <p className={descriptionStyle}>예상치 못한 꼬리 질문 훈련으로</p>
              <p className={descriptionStyle}>
                실전 면접 상황에서의 대응력 향상
              </p>
            </div>
          </li>

          <li>
            <div className={imageStyle}>
              <img src={feedback} alt="피드백 그림" />
            </div>
            <div className={textStyle}>
              <strong className={titleStyle}>면접 유형별 피드백</strong>
              <p className={descriptionStyle}>구체적인 피드백으로</p>
              <p className={descriptionStyle}>취업 경쟁력 강화</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default KeyPointSection;
