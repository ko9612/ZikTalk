import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxStyle from "./_components/BoxStyle";
import PdfDownload from "./_components/PdfDownload";
import FaqItem from "@/components/common/FaqItem";

const titleStyle =
  "text-zik-text text-[20px] sm:text-[24px] md:text-[28px] font-bold mt-[25px] md:mt-[50px]";

const qaList = [
  {
    id: 1,
    career: "인성",
    question:
      "협업 중 코드 스타일이나 방향성 차이로 팀원과 갈등이 생긴 경험이 있나요?",
    answer:
      "팀 프로젝트에서 코드 스타일과 구현 방식에 대한 이견으로 갈등이 있었습니다. 각자의 입장이 있었지만, 팀의 일관성과 효율을 위해 코드 컨벤션을 정하고 사전 설계를 공유하면서 의견을 조율했습니다.",
    recommendation:
      "협업 중 한 팀원과 컴포넌트 구조 방식에 대해 충돌이 있었습니다. 직접 대화하며 서로의 입장을 듣고, 프로젝트의 유지보수성과 팀 내 일관성을 고려한 기준을 함께 정했습니다. 이후 코드 리뷰 문화를 도입해 유사한 문제를 사전에 방지할 수 있었습니다.",
  },
  {
    id: 2,
    career: "직무",
    question: "RESTful API란 무엇인가요?",
    answer:
      "RESTful API는 HTTP 프로토콜을 기반으로 한 아키텍처 스타일로, 자원을 URI로 표현하고, HTTP 메서드(GET, POST, PUT, DELETE 등)를 통해 자원에 대한 행위를 명확히 구분하는 API 설계 방식입니다.",
    recommendation:
      "RESTful API는 자원 중심의 API 설계 방식입니다. 각 자원은 고유한 URI로 표현되고, HTTP 메서드를 통해 해당 자원에 대한 CRUD 동작을 수행합니다. 클라이언트와 서버 간 역할이 명확히 분리되어 있으며, 일관성 있고 확장 가능한 구조를 갖출 수 있습니다.",
  },
  {
    id: 3,
    career: "직무",
    question: "스택과 큐의 차이점에 대해 설명해주세요.",
    answer:
      "스택은 후입선출(LIFO), 큐는 선입선출(FIFO) 방식의 자료구조입니다. 스택은 함수 호출 시 콜 스택 등에서, 큐는 작업 처리 순서를 유지해야 하는 대기열 등에서 사용됩니다.",
    recommendation:
      "스택은 마지막에 들어간 데이터가 먼저 나오는 구조이고, 큐는 가장 먼저 들어간 데이터가 먼저 나옵니다. 예를 들어, 스택은 웹 브라우저의 방문 기록(뒤로 가기)에, 큐는 프린터 작업 대기열에 적합합니다. 처리 순서와 구조 특성에 따라 선택됩니다.",
  },
  {
    id: 4,
    career: "직무",
    question: "주어진 API의 성능을 최적화하려면 어떻게 해야 할까요?",
    answer:
      "API의 성능을 최적화하려면 불필요한 연산 제거, 캐싱 적용, 응답 크기 최소화, DB 쿼리 최적화, 비동기 처리 등의 방법을 사용할 수 있습니다.",
    recommendation:
      "응답 속도가 느린 API의 경우, DB 쿼리 최적화나 인덱스 추가, 캐시(redis 등) 도입, 필요 없는 필드 제거 등을 우선 검토합니다. 또한 응답 구조를 간결하게 하고, 가능하다면 비동기 처리를 도입하여 시스템의 처리 효율을 높입니다.",
  },
  {
    id: 5,
    career: "직무",
    question: "CI/CD란 무엇이며, 왜 중요한가요?",
    answer:
      "CI/CD는 Continuous Integration/Continuous Deployment의 약자로, 코드 변경 사항을 자동으로 빌드, 테스트, 배포하는 일련의 프로세스를 의미합니다. 개발 효율성과 안정성을 높입니다.",
    recommendation:
      "CI/CD는 코드 변경이 있을 때마다 자동으로 테스트와 빌드, 배포가 이루어지는 개발 방식입니다. GitHub Actions, Jenkins, GitLab CI 등을 활용해 품질 보장과 빠른 피드백을 얻을 수 있어, 협업 시 코드 신뢰성과 배포 효율성이 크게 향상됩니다.",
  },
  {
    id: 6,
    career: "직무",
    question: "서버 사이드에서 파일 업로드를 처리하는 방법은 무엇인가요?",
    answer:
      "서버에서 파일 업로드를 처리하려면 클라이언트로부터 multipart/form-data 형식으로 받은 파일을 서버의 파일 시스템이나 클라우드 스토리지(S3 등)에 저장합니다. 백엔드에서는 multer(Node.js), Spring Multipart 등으로 처리합니다.",
    recommendation:
      "파일 업로드 시 클라이언트는 multipart/form-data 형식으로 전송하며, 서버는 이를 multer(Node.js)나 Spring의 MultipartResolver로 처리합니다. 저장 위치는 서버의 디렉토리 또는 AWS S3 같은 외부 스토리지를 활용하며, 보안과 용량 관리가 중요합니다.",
  },
];

const Index = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const navigate = useNavigate();

  const gotoMypageResult = () => {
    navigate("/mypage/result-list");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-7">
      <article id="pdf-download">
        <div className="w-full max-w-[1200px]">
          {/* 결과 분석 상단 */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={gotoMypageResult}
              className="text-zik-main flex items-center text-xs font-semibold sm:text-base md:text-lg"
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
              user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의
              면접 준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어
              있으며, 실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다.
              면접 자세와 답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수
              있습니다.
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
              user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의
              면접 준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어
              있으며, 실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다.
              면접 자세와 답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수
              있습니다.
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
              user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의
              면접 준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어
              있으며, 실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다.
              면접 자세와 답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수
              있습니다.
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
                    src={""}
                  />
                ) : (
                  <div className="w-full text-center text-gray-500">
                    질문을 선택하면 영상이 표시됩니다.
                  </div>
                )}
              </BoxStyle>

              <BoxStyle title="질문" className="max-h-[410px] w-full">
                <ul className="flex flex-col">
                  {qaList.map((question) => (
                    <li
                      key={question.id}
                      className="border-zik-border hover:bg-zik-main/10 block max-w-full cursor-pointer truncate border-b p-4"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      <span className="mr-4 text-xl font-bold">
                        {question.id}
                      </span>
                      <span className="md:text-lg">{question.question}</span>
                    </li>
                  ))}
                </ul>
              </BoxStyle>
            </div>
          </div>

          <h3 className={titleStyle}>질문</h3>
          <div>
            {qaList.map((item) => (
              <FaqItem key={item.id} {...item} />
            ))}
          </div>
        </div>
      </article>

      {/* fileName 추후 변경 */}
      <PdfDownload rootElementId="pdf-download" fileName="백엔드 개발자-1" />
    </div>
  );
};

export default Index;
