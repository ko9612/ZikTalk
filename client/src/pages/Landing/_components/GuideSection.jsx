// 한재우
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const faqList = [
  {
    question: "제휴 리스트에 우리 학교, 기관이 없으면 어떻게 해야하나요?",
    answer:
      "제휴를 원하시는 학교나 기관은 홈페이지 하단의 문의하기를 통해 연락주시면 검토 후 안내해 드리겠습니다.",
    recommendation: "",
    expanded: false,
  },
  {
    question: "면접 가이드는 어떤식으로 제공되나요?",
    answer:
      "직무별, 산업별 맞춤형 면접 가이드를 제공하며, 실제 면접에서 자주 물어보는 질문과 모범 답안을 확인할 수 있습니다.",
    recommendation: "",
    expanded: false,
  },
  {
    question: "잡다 면접 연습을 어떻게 활용하면 좋을까요?",
    answer:
      "실제 면접 상황을 가정하고 연습하시면 좋습니다. 답변 후에는 AI의 피드백을 참고하여 개선점을 파악하고 반복 연습하는 것이 효과적입니다.",
    recommendation: "",
    expanded: false,
  },
];

// function autoLineBreak(text) {
//   if (!text) return "";
//   return text.replace(/(\.|\?|\!)/g, "$1\n");
// }

const GuideSection = () => {
  const [faqs, setFaqs] = React.useState(faqList);
  const faqsRef = useRef(null);
  const isFaqsInView = useInView(faqsRef, {
    once: true,
    threshold: 0.1,
  });

  const toggleFaq = (index) => {
    setFaqs(
      faqs.map((faq, i) =>
        i === index ? { ...faq, expanded: !faq.expanded } : faq,
      ),
    );
  };

  return (
    <section className="flex w-full flex-col items-center bg-white py-20 md:py-28">
      {/* 타이틀 위에 띄우기 mt-16 mb-16 */}
      <div className="w-max-[1200px] mx-auto mt-16 mb-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-1.5 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          ZIKTALK 면접연습
        </h2>
        <p className="mb-13 text-center text-xl font-bold sm:text-2xl">
          더 자세히 알고 싶다면?
        </p>
        <div ref={faqsRef} className="flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <motion.li
              key={idx}
              initial={{ y: 50, opacity: 0 }}
              animate={isFaqsInView && { y: 0, opacity: 1 }}
              transition={{
                delay: idx * 0.2,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="list-none"
            >
              <div
                className="w-full cursor-pointer rounded-xl border border-gray-400 bg-white transition-all duration-300"
                style={{ minHeight: 56 }}
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex items-center px-4 py-4 sm:px-7 sm:py-5">
                  <img
                    src="/src/assets/images/Q.svg"
                    alt="Q"
                    className="mr-2 h-4 w-4 sm:mr-3 sm:h-5 sm:w-5"
                  />
                  <span className="flex-1 text-left text-sm leading-tight font-semibold text-gray-600 sm:text-base">
                    {faq.question}
                  </span>
                  <span
                    className={`ml-2 flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7 ${faq.expanded ? "rotate-180" : ""} transition-transform duration-300`}
                  >
                    <svg
                      width="15"
                      height="23"
                      viewBox="0 0 20 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                        fill="#7B7B7B"
                        stroke="#7B7B7B"
                        strokeWidth="0.0488281"
                      />
                    </svg>
                  </span>
                </div>
                <div
                  className={`overflow-hidden rounded-b-2xl bg-white px-4 transition-all duration-300 sm:px-6 ${
                    faq.expanded
                      ? "max-h-[200px] py-2 opacity-100 sm:max-h-[150px]"
                      : "max-h-0 py-0 opacity-0"
                  }`}
                  style={{ willChange: "max-height, opacity, padding" }}
                >
                  {/* 답변 섹션 */}
                  {faq.answer && (
                    <div className="mb-4">
                      <div className="mb-2 text-sm font-medium text-gray-200"></div>
                      <div className="rounded-2xl bg-gray-50 p-3 text-sm text-gray-500 sm:p-4 sm:text-base">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuideSection;
