import FaqItem from "@/components/common/FaqItem";
import React from "react";

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

function Question() {
  return (
    <div className="text-zik-text">
      {qaList.map((item) => (
        <FaqItem key={item.id} {...item} />
      ))}
    </div>
  );
}

export default Question;
