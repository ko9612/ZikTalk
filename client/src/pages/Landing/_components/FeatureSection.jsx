import React, { useRef } from "react";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";
import AnalysisPageImg from "@/assets/images/analysisPage_example.svg";
import { jobData, levels, savedQuestions } from "@/data/landingData";
import { motion, useInView } from "framer-motion";
import JobCard from "@/pages/Landing/_components/card/JobCard";
import { twMerge } from "tailwind-merge";

const FeatureSection = () => {
  // 난이도별 질문 ref
  const difficultyRef = useRef(null);
  const isDifficultyView = useInView(difficultyRef, {
    once: true,
  });

  // 다시보고 싶은 질문 ref
  const bookmarkRef = useRef(null);
  const isBookmarkRef = useInView(bookmarkRef, {
    once: true,
  });

  // 면접 분석 ref
  const analysisResultRef = useRef(null);
  const isAnalysisResultRef = useInView(analysisResultRef, {
    once: true,
  });

  const filtered =
    "absolute bottom-0 left-0 w-full h-28 rounded-3xl bg-linear-to-b from-transparent to-[#484498]/40 z-10";

  return (
    <section className="px-6 py-24 xl:px-0">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
        <strong className="text-center text-2xl/normal sm:text-4xl/normal">
          AI 음성 면접으로 완성하는 <br /> 나만의 취업 경쟁력
        </strong>
        <div className="grid w-full grid-cols-1 grid-rows-4 gap-y-6 pt-16 md:grid-cols-5 md:grid-rows-2 md:gap-6">
          {/* 직무별 질문 */}
          <article className="bg-zik-main/80 relative col-span-3 overflow-hidden rounded-3xl">
            <div className={`${filtered}`}></div>
            <div className="flex flex-col gap-5 p-7">
              <strong className="text-xl text-white md:text-3xl">
                직무별 질문
              </strong>
              <p className="text-base font-medium text-white lg:text-lg">
                지원한 직무에 맞춘 맞춤형 질문으로, <br /> 직무 이해도를
                효과적으로 점검할 수 있도록 돕습니다. <br /> 실제 면접처럼 실전
                감각을 키뭐보세요
              </p>
              <div className="flex flex-col gap-4 pt-6">
                <motion.ul
                  className="flex w-max flex-nowrap gap-4"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 30,
                    ease: "linear",
                  }}
                >
                  {[...jobData.slice(0, 6), ...jobData.slice(0, 6)].map(
                    (job, i) => (
                      <JobCard key={`${job.title}-${i}`} {...job} />
                    ),
                  )}
                </motion.ul>
                <motion.ul
                  className="flex w-max flex-nowrap gap-4"
                  animate={{ x: ["-50%", "0%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 30,
                    ease: "linear",
                  }}
                >
                  {[...jobData.slice(6, 12), ...jobData.slice(6, 12)].map(
                    (job, i) => (
                      <JobCard key={`${job.title}-${i}`} {...job} />
                    ),
                  )}
                </motion.ul>
              </div>
            </div>
          </article>
          {/* 난이도별 질문 */}
          <article
            ref={difficultyRef}
            className="bg-zik-main/50 relative col-span-2 overflow-hidden rounded-3xl"
          >
            <div className={`${filtered}`}></div>
            <div className="relative flex h-full flex-col gap-5 p-7">
              <strong className="text-xl text-white md:text-3xl">
                난이도별 질문
              </strong>
              <p className="text-base font-medium text-white lg:text-lg">
                초보자도 걱정없이 시작! <br /> 난이도별 질문으로 자연스럽게
                <br /> 면접 실력을 끌어올리세요
              </p>
              <div className="absolute right-0 bottom-7 w-[75%]">
                <ul className="grid grid-cols-1 gap-3">
                  {levels.map((level, i) => (
                    <motion.li
                      key={level.label}
                      initial={{ y: 40, opacity: 0 }}
                      animate={isDifficultyView && { y: 0, opacity: 1 }}
                      transition={{
                        delay: i * 0.4,
                        duration: 1,
                        ease: "easeOut",
                      }}
                      className={twMerge(
                        "flex gap-10 rounded-tl-xl rounded-bl-xl bg-white p-4 text-gray-400 shadow-md lg:p-5",
                        level.highlight && "bg-zik-main text-white",
                      )}
                    >
                      {level.highlight && (
                        <FaRegCircleCheck className="mt-1 shrink-0 text-xl text-white" />
                      )}
                      <div className={`${level.highlight !== "pl-14"}`}>
                        <div
                          className={twMerge(
                            "flex items-center gap-8 text-base/normal",
                            level.stars >= 4 && "gap-6",
                          )}
                        >
                          <strong>{level.label}</strong>
                          <div className="flex gap-0.5">
                            {[...Array(level.stars)].map((_, i) => (
                              <FaStar key={i} />
                            ))}
                          </div>
                        </div>
                        {level.description && (
                          <p className="pt-3 text-sm text-nowrap">
                            {level.description}
                          </p>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
          {/* 다시보고 싶은 질문 */}
          <article
            ref={bookmarkRef}
            className="bg-zik-main/50 relative col-span-2 overflow-hidden rounded-3xl"
          >
            <div className={`${filtered}`}></div>
            <div className="relative flex h-full flex-col gap-5 p-7">
              <strong className="text-3xl text-nowrap text-white">
                다시보고 싶은 질문
              </strong>
              <p className="text-base font-medium text-white lg:text-lg">
                기억하고싶은 질문은 저장! <br /> 나만의 질문 리스트로 면접
                준비를 해보세요
              </p>
              <div className="absolute -bottom-2 left-1/2 w-[75%] -translate-x-1/2 overflow-hidden">
                <ul className="flex flex-col gap-3">
                  {savedQuestions.map((q, i) => (
                    <motion.li
                      key={`${q.title}-${i}`}
                      initial={{ y: 40, opacity: 0 }}
                      animate={isBookmarkRef && { y: 0, opacity: 1 }}
                      transition={{
                        delay: i * 0.4,
                        duration: 1,
                        ease: "easeOut",
                      }}
                      className={twMerge(
                        "rounded-2xl bg-white px-6 py-2 text-[12px] shadow-md",
                        q.opened && "pb-4",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                          <strong className="line-clamp-1 w-[90px]">
                            {q.title}
                          </strong>
                          <span className="text-nowrap">{q.category}</span>
                        </div>
                        <div className="flex gap-6">
                          <FaAngleUp
                            className={twMerge(
                              "text-zik-text rotate-180",
                              q.opened && "rotate-0",
                            )}
                          />
                          <FaStar className="text-zik-main" />
                        </div>
                      </div>
                      {q.opened && q.details && (
                        <ul className="flex flex-col gap-2 pt-2">
                          {q.details.map((item, j) => (
                            <li
                              key={`${item.label}-${j}`}
                              className="border-zik-border rounded-xl border p-1.5"
                            >
                              <strong className="text-[12px]">
                                {item.label}
                              </strong>
                              <p className="text-zik-text line-clamp-2 text-[9px]">
                                {item.text}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
          {/* 면접 분석 */}
          <article
            ref={analysisResultRef}
            className="bg-zik-main/80 relative col-span-3 h-[500px] overflow-hidden rounded-3xl sm:h-[600px] md:h-full"
          >
            <div className={`${filtered}`}></div>
            <div className="flex flex-col gap-5 p-7">
              <strong className="text-xl text-white md:text-3xl">
                면접 분석
              </strong>
              <p className="text-base font-medium text-white lg:text-lg">
                면접 내용을 종합분석하여 총평부터 <br /> 인성/직무 질문
                피드백까지 상세하게 제공해요
              </p>
              <div>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={isAnalysisResultRef && { y: 0, opacity: 1 }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                  className="absolute -bottom-4 left-1/2 w-[80%] -translate-x-1/2 overflow-hidden rounded-t-3xl"
                >
                  <img
                    src={AnalysisPageImg}
                    alt="AnalysisPage example"
                    className="w-full"
                  />
                </motion.div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
