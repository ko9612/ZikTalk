import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxStyle from "./_components/BoxStyle";
import PdfDownload from "./_components/PdfDownload";
import FaqItem from "@/components/common/FaqItem";
import { useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useParams } from "react-router-dom";

const careerType = {
  JOB: "직무",
  PERSONALITY: "인성",
};

const titleStyle =
  "text-zik-text text-[20px] sm:text-[24px] md:text-[28px] font-bold mt-[25px] md:mt-[50px]";

const Index = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [isQuestions, setIsQuestions] = useState([]);

  const { resultId } = useParams();
  const navigate = useNavigate();

  const {
    role,
    totalScore,
    summary,
    strengths,
    improvements,
    personalityScore,
    personalityEval,
    jobScore,
    jobEval,
    createdAt,
  } = result || {};

  const formattedDate = createdAt
    ? new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, "")
    : "";

  const pdfTitle = `${role}_${formattedDate}`;

  const interviewDate = createdAt
    ? new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, ".")
    : "";

  const getGrade = (score) => {
    if (score >= 90) return { graphState: "우수", graphColor: "#10B981" };
    if (score >= 80) return { graphState: "양호", graphColor: "#3B82F6" };
    if (score >= 70) return { graphState: "보통", graphColor: "#FACC15" };
    if (score >= 60) return { graphState: "미흡", graphColor: "#F97316" };
    return { graphState: "부족", graphColor: "#EF4444" };
  };

  const {
    graphState: personalityGraphState,
    graphColor: personalityGraphColor,
  } = getGrade(personalityScore);
  const { graphState: jobGraphState, graphColor: jobGraphColor } =
    getGrade(jobScore);

  // 북마크
  const bookmarkHandler = async (index) => {
    const question = isQuestions[index];
    const updatedBookmark = !question.bookmarked;

    setIsQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, bookmarked: updatedBookmark } : q,
      ),
    );

    try {
      await axiosInstance.patch(`/questions/${question.id}/bookmark`, {});
    } catch (e) {
      console.error("북마크 업데이트 실패", e);

      // 북마크 변경사항 저장 실패 시 롤백
      setIsQuestions((prev) =>
        prev.map((q, i) =>
          i === index ? { ...q, bookmarked: !updatedBookmark } : q,
        ),
      );
    }
  };

  useEffect(() => {
    axiosInstance
      .get(`/interview/${resultId}`)
      .then((res) => {
        setResult(res.data);
        setIsQuestions(res.data.questions);
      })
      .catch((e) => console.error("결과 가져오기 실패", e));
  }, [resultId]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-7">
      <article id="pdf-download">
        <div className="w-full max-w-[1200px]">
          {/* 결과 분석 상단 */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/mypage/result-list")}
              className="text-zik-main flex items-center text-[9px] font-semibold sm:text-base md:text-lg"
              id="delPdf1"
            >
              <svg
                width="15"
                height="8"
                viewBox="0 0 20 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-90"
              >
                <path
                  d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z"
                  fill="#7871FE"
                  stroke="#7871FE"
                  strokeWidth="0.0488281"
                />
              </svg>
              분석결과리스트
            </button>
            <h2 className="text-zik-text max-w-[200px] text-center text-xl font-bold break-words sm:max-w-full sm:text-3xl md:text-4xl">
              {role}
            </h2>
            <p className="text-zik-text text-[9px] sm:text-xs md:text-sm">
              {interviewDate}
            </p>
          </div>

          <h3 className={titleStyle}>종합 분석</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <BoxStyle type="score" title="총 점수" score={totalScore}>
              {summary}
            </BoxStyle>

            <div className="grid gap-4 sm:grid-rows-2">
              <BoxStyle title="좋은 점">{strengths}</BoxStyle>

              <BoxStyle title="개선할 점">{improvements}</BoxStyle>
            </div>
          </div>
          <div className="mt-4 gap-4 sm:flex sm:flex-nowrap">
            <BoxStyle
              type="graph"
              title="인성 면접"
              score={personalityScore}
              graphState={personalityGraphState}
              graphStrokeWidth={20}
              graphColor={personalityGraphColor}
              className={"mb-4 min-w-0 flex-1"}
            >
              {personalityEval}
            </BoxStyle>

            <BoxStyle
              type="graph"
              title="직무 면접"
              score={jobScore}
              graphState={jobGraphState}
              graphStrokeWidth={20}
              graphColor={jobGraphColor}
              className={"mb-4 min-w-0 flex-1"}
            >
              {jobEval}
            </BoxStyle>
          </div>

          <div id="delPdf2">
            <h3 className={titleStyle}>면접 영상</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BoxStyle title="" className="min-h-[200px]">
                {selectedQuestion ? (
                  <video
                    className="w-full rounded-lg border"
                    controls
                    src={selectedQuestion}
                  />
                ) : (
                  <div className="w-full text-center text-gray-500">
                    질문을 선택하면 영상이 표시됩니다.
                  </div>
                )}
              </BoxStyle>

              <BoxStyle title="질문" className="max-h-[410px] w-full">
                <ul className="flex flex-col">
                  {isQuestions &&
                    isQuestions.map((item, index) => (
                      <li
                        key={index}
                        className="border-zik-border hover:bg-zik-main/10 block max-w-full cursor-pointer truncate border-b p-4"
                        onClick={() => setSelectedQuestion(item.videoUrl)}
                      >
                        <span className="mr-4 text-xl font-bold">
                          {index + 1}
                        </span>
                        <span className="md:text-lg">{item.content}</span>
                      </li>
                    ))}
                </ul>
              </BoxStyle>
            </div>
          </div>

          <h3 className={titleStyle}>질문</h3>
          <div>
            {isQuestions &&
              isQuestions.map((item, index) => (
                <FaqItem
                  key={index}
                  id={index + 1}
                  career={careerType[item.type] || item.type}
                  question={item.content}
                  answer={item.myAnswer}
                  recommendation={item.recommended}
                  isStarred={item.bookmarked}
                  onStarToggle={() => bookmarkHandler(index)}
                />
              ))}
          </div>
        </div>
      </article>

      <PdfDownload rootElementId="pdf-download" fileName={pdfTitle} />
    </div>
  );
};

export default Index;
