// job data
import Accounter from "@/assets/images/landing_icon/job_accounter.svg";
import Teacher from "@/assets/images/landing_icon/job_teacher.svg";
import Marketer from "@/assets/images/landing_icon/job_marketer.svg";
import WebDesigner from "@/assets/images/landing_icon/job_webDesigner.svg";
import WebDeveloper from "@/assets/images/landing_icon/job_webDeveloper.svg";
import Analyzer from "@/assets/images/landing_icon/job_analyzer.png";
import ProductManager from "@/assets/images/landing_icon/job_productManager.png";
import ServicePlanner from "@/assets/images/landing_icon/job_servicePlanner.png";
import GameDeveloper from "@/assets/images/landing_icon/job_gameDeveloper.png";
import VideoEditor from "@/assets/images/landing_icon/job_videoEditor.png";
import Nurse from "@/assets/images/landing_icon/job_nurse.png";
import Security from "@/assets/images/landing_icon/job_security.png";

export const jobData = [
  {
    title: "백엔드 개발자",
    image: WebDeveloper,
    question: "MVC 패턴에 대해 설명해주세요.",
  },
  {
    title: "웹 디자이너",
    image: WebDesigner,
    question: "모바일 퍼스트 디자인 접근법에 대해 설명해주세요.",
  },
  {
    title: "마케터",
    image: Marketer,
    question: "AIDA 모델에 대해 설명해주세요.",
  },
  {
    title: "회계사",
    image: Accounter,
    question: "재무제표 3가지 종류와 각자의 주요 항목은?",
  },
  {
    title: "간호사",
    image: Nurse,
    question: "환자의 보호자에게 중요한 설명을 할 때 어떻게 접근하시겠어요?",
  },
  {
    title: "데이터 분석가",
    image: Analyzer,
    question: "데이터 전처리 과정에서 주의할 점은 무엇인가요?",
  },
  {
    title: "교사",
    image: Teacher,
    question: "수업 중 학생들의 집중력이 떨어질 때 어떻게 대처하시겠어요?",
  },
  {
    title: "프로덕트 매니저",
    image: ProductManager,
    question: "제품 개발에서 PRD란 무엇이며 왜 중요한가요?",
  },
  {
    title: "보안 전문가",
    image: Security,
    question: "OWASP Top 10 중 하나를 예로 들어 설명해주세요.",
  },
  {
    title: "게임 개발자",
    image: GameDeveloper,
    question: "Unity에서 성능 최적화를 위해 사용하는 기법은?",
  },
  {
    title: "서비스 기획자",
    image: ServicePlanner,
    question: "기능 기획 시 사용자 페르소나를 설정하는 이유는?",
  },
  {
    title: "영상 편집자",
    image: VideoEditor,
    question: "컷 편집 시 중요한 리듬감 요소는 무엇인가요?",
  },
];

export const levels = [
  {
    label: "신입",
    stars: 1,
    highlight: true,
    description: (
      <>
        처음이라도 괜찮아요. 기초역량과 성장 가능성을 중심으로 묻습니다. <br />
        실무 경험이 없어도 답할 수 있는 질문들로 구성되어 있어요.
      </>
    ),
  },
  { label: "경력 1 ~ 3년", stars: 2 },
  { label: "경력 4 ~ 7년", stars: 3 },
  { label: "경력 7년 이상", stars: 4 },
];

export const savedQuestions = [
  {
    title: "프론트엔드 개발자",
    category: "직무",
    details: [
      {
        label: "질문",
        text: "페이지 로딩 속도가 느릴 때 어떤 방식으로 원인을 파악하고 해결하나요?",
      },
      {
        label: "내 답변",
        text: "크롬 개발자 도구의 Lighthouse 또는 Perfomance 탭을 사용해 성능 지표를 확인하여 TTFB, FCP 같은 주요 지표들을 보고 병목이 있는 지 볼 것 같습니다.",
      },
      {
        label: "추천 답변",
        text: "가장 먼저 Chrome DevTools의 Lighthouse나 Perfomance 탭을 활용해 성능 지표를 확인합니다. 주요 지표인 TTFB, LCP, CLS 등을 기준으로 병목 구간을 파악합니다.",
      },
    ],
    opened: true,
  },
  {
    title: "웹 퍼블리셔",
    category: "직무",
  },
  {
    title: "교사",
    category: "인성",
  },
  {
    title: "마케터",
    category: "인성",
  },
];
