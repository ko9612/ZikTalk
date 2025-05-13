// 1. 비즈니스 로직 처리
// 비즈니스 규칙을 기반으로 데이터를 처리
// 데이터 검증, 권한 체크, 복잡한 계산 로직 등을 포함

// 2. 데이터베이스 상호작용
// Prisma 또는 다른 데이터베이스 클라이언트와 직접 상호작용하여 데이터를 생성, 조회, 수정, 삭제
// 트랜잭션 처리나 복잡한 데이터 연관 관계를 관리

// 3. 외부 API 통신
// OpenAI, Daglo, AWS S3와 같은 외부 API와의 통신을 처리

// 4. 에러 처리
// 데이터베이스와의 상호작용 중 발생하는 에러를 명확하게 정의하여 컨트롤러로 전달

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generateQuestion = async (
  level,
  qCount,
  career,
  ratio,
  curNum,
  preQuestion,
  preAnswer,
  skillCnt
) => {
  const skillCount = Math.floor(qCount * (ratio / 100));
  const personalityCount = qCount - skillCount;
  const remainingSkillQuestions = skillCount - skillCnt;
  const currentStage = curNum === 1 ? "시작" : "진행 중";
  const prompt = "";
  const prompt1 = `
  "${career}" 직무면접 준비를 위한 "${level}" 수준의 면접 질문을 생성한다. **질문은 무조건 1개만 제시한다.**
  - 총 질문 수: ${qCount}개 (인성 질문 ${personalityCount}개, 직무 질문 ${skillCount}개)
  - 현재 질문 번호: ${curNum} / ${qCount} (${currentStage})
  - 남은 직무 질문: ${remainingSkillQuestions}개
  - 남은 인성 질문: ${qCount - curNum - remainingSkillQuestions}개
  - 질문 유형: 직무 또는 인성
  - 직무 질문(hard skill):지원자의 직무 능력, 기술적 이해도, 문제 해결 능력을 평가하기 위한 질문
  - 인성 질문 (soft skill):지원자의 성향, 커뮤니케이션 능력, 팀워크, 문제 해결 방식을 평가하기 위한 질문
  - 무조건 경력에 적합한 질문이어야 함
  - 질문 외 다른 문장은 포함하지 말 것
  - **질문은 무조건 1개만 제시한다.*
  ${
    preQuestion && preAnswer
      ? `- 이전 질문: "${preQuestion}"
    - 이전 질문에 대한 답변: "${preAnswer}" => 이 답변에 대한 꼬리질문은 이어가도 좋고, 새로운 질문이어도 좋다. (꼬리질문 확률: 30%, 새로운 질문 확률: 70%)`
      : ""
  }
  - 반환 형식 (JSON):
    {
      "type": "직무 또는 인성",
      "question": "질문 내용"
    }
  `;
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: prompt }],
    });
    console.log(res);
    return res;
  } catch (error) {
    throw new Error("첫 질문 생성 실패");
  }
};

export const dagloTextConverter = async (audioBlob) => {
  try {
    const { DagloAPI } = await import(
      "https://actionpower.github.io/dagloapi-js-beta/lib/daglo-api.module.js"
    );
    const client = new DagloAPI({
      apiToken: process.env.DAGLO_API_KEY,
    });

    const transcriber = client.stream.transcriber();

    const transcript = await new Promise((resolve, reject) => {
      transcriber.on("transcript", (data) => {
        resolve(data.text);
      });

      transcriber.on("error", (err) => {
        reject(err);
      });

      transcriber.connect(audioBlob);
    });
    console.log(transcript);
    return transcript;
  } catch (error) {
    console.error("Daglo API Error:", error);
    throw new Error("음성 변환 실패");
  }
};
