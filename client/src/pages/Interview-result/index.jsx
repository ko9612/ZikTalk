import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxStyle from "./_components/BoxStyle";
import Question from "./_components/Question";

const titleStyle =
  "text-zik-text text-[20px] sm:text-[24px] md:text-[28px] font-bold mt-[25px] md:mt-[50px]";

const questions = [
  {
    id: 1,
    text: "협업 중 코드 스타일이나 방향성 차이로 팀원과 갈등이 생긴 경험이 있나요?",
  },
  { id: 2, text: "RESTful API란 무엇인가요?" },
  { id: 3, text: "스택과 큐의 차이점에 대해 설명해주세요." },
  { id: 4, text: "주어진 API의 성능을 최적화하려면 어떻게 해야 할까요?" },
  { id: 5, text: "CI/CD란 무엇이며, 왜 중요한가요?" },
  { id: 6, text: "서버 사이드에서 파일 업로드를 처리하는 방법은 무엇인가요?" },
];

const Index = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const navigate = useNavigate();

  const gotoMypageResult = () => {
    navigate("/mypage/result-list");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-7">
      <div className="w-full max-w-[1200px]">
        {/* 결과 분석 상단 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={gotoMypageResult}
            className="text-zik-main flex items-center text-xs font-semibold sm:text-base md:text-lg"
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
          <h2 className="text-zik-text text-2xl font-bold sm:text-3xl md:text-4xl">
            백엔드 개발자-1
          </h2>
          <p className="text-zik-text text-xs md:text-sm">2025.04.19</p>
        </div>

        <h3 className={titleStyle}>종합 분석</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <BoxStyle
            type="score"
            title="총 점수"
            score="85"
            text="양호"
            strokeWidth={20}
            color={"#3B82F6"}
          >
            user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의 면접
            준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어 있으며,
            실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다. 면접 자세와
            답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수 있습니다.
          </BoxStyle>

          <div className="grid gap-4 sm:grid-rows-2">
            <BoxStyle title="좋은 점">
              user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의
              면접 준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어
              있으며, 실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다.
              면접 자세와 답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수
              있습니다.
            </BoxStyle>

            <BoxStyle title="개선할 점">
              user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의
              면접 준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어
              있으며, 실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다.
              면접 자세와 답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수
              있습니다.
            </BoxStyle>
          </div>
        </div>
        <div className="mt-4 gap-4 sm:flex">
          <BoxStyle
            type="graph"
            title="인성 면접"
            score="88"
            graphState="양호"
            graphStrokeWidth={20}
            graphColor={"#3B82F6"}
            className={"mb-4"}
          >
            user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의 면접
            준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어 있으며,
            실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다. 면접 자세와
            답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수 있습니다.
          </BoxStyle>

          <BoxStyle
            type="graph"
            title="직무 면접"
            score="77"
            graphState="보통"
            graphStrokeWidth={20}
            graphColor={"#FACC15"}
            className={"mb-4"}
          >
            user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의 면접
            준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어 있으며,
            실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다. 면접 자세와
            답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수 있습니다.
          </BoxStyle>
        </div>

        <h3 className={titleStyle}>면접 영상</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BoxStyle title="" className="min-h-[200px]">
            {selectedQuestion ? (
              <video className="w-full rounded-lg border" controls src={""} />
            ) : (
              <div className="w-full text-center text-gray-500">
                질문을 선택하면 영상이 표시됩니다.
              </div>
            )}
          </BoxStyle>

          <BoxStyle title="좋은 점" className="max-h-[410px] w-full">
            <ul className="flex flex-col">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className="border-zik-border hover:bg-zik-main/10 block max-w-full cursor-pointer truncate border-b p-4"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <span className="mr-4 text-xl font-bold">{question.id}</span>
                  <span className="md:text-lg">{question.text}</span>
                </li>
              ))}
            </ul>
          </BoxStyle>
        </div>

        <h3 className={titleStyle}>질문</h3>
        <Question />
      </div>
    </div>
  );
};

export default Index;
