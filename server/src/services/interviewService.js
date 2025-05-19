import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generateQuestion = async (level, qCount, career, ratio) => {
  const skillCount = Math.round(qCount * (ratio / 100));
  const personalityCount = qCount - skillCount;
  const prompt = `
  "${career}" 직무면접 준비를 위한 "${level}" 수준의 면접 질문을 생성한다.
  - 총 질문 수: ${qCount}개 (인성 질문 ${personalityCount}개, 직무 질문 ${skillCount}개)
  - 질문 유형: 직무 또는 인성
  - 직무 질문(hard skill):지원자의 직무 능력, 기술적 이해도, 문제 해결 능력을 평가하기 위한 질문
  - 인성 질문 (soft skill):지원자의 성향, 커뮤니케이션 능력, 팀워크, 문제 해결 방식을 평가하기 위한 질문
  - 무조건 경력에 적합한 질문이어야 함
  - 질문 외 다른 문장은 포함하지 말 것
  - 반환 형식은 아래와 값으며, 배열에 담아서 반환한다. 특정 키에 배열을 넣은 객체 형태가 아닌, 오직 배열만 반환한다. -> [{...},{...},{...}]
  - 반환 형식 (JSON):
    {
      "number": 1,
      "type": "직무 또는 인성",
      "question": "질문 내용"
    },
    {
      "number": 2,
      "type": "직무 또는 인성",
      "question": "질문 내용"
    },
    ...
    {
      "number": 5,
      "type": "직무 또는 인성",
      "question": "질문 내용"
    },
  `;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [{ role: "user", content: prompt }],
      });
      return res;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};

export const generateFeedback = async (data) => {
  const prompt = `
  "${data.career}" 직무면접 준비를 위한 "${
    data.level
  }" 수준의 면접 질문에 대한 답변을 평가합니다.
  - 총 질문 수: ${data.content.length}개
  - 질문과 답변 목록:
  ${data.content
    .map(
      (q, index) =>
        `${index + 1}. 질문: "${q.question}" / 답변: "${
          q.answer
        }" / 질문 유형: "${q.type}"`
    )
    .join("\n")}
  - 질문 유형:
    - **직무 질문 (Hard Skill)**: 지원자의 직무 능력, 기술적 이해도, 문제 해결 능력을 평가하기 위한 질문
    - **인성 질문 (Soft Skill)**: 지원자의 성향, 커뮤니케이션 능력, 팀워크, 문제 해결 방식을 평가하기 위한 질문
  
  **반환 형식 (JSON) 외 다른 형식은 포함하지 마세요.**
  
  - **반환 형식 (JSON)**:
  {
    "personalityScore": 85,
    "personalityEval": "인성 질문 답변에 대한 전체적인 평가...",
    "jobScore": 77,
    "jobEval": "직무 질문 답변에 대한 전체적인 평가...",
    "summary": "전체 질문 답변에 대한 종합 평가...",
    "strengths": "전체적인 답변에 대한 좋은 점...",
    "improvements": "전체적인 답변에 대한 개선할 점...",
    "recommended": [
      "1번 질문에 대한 모범 답변",
      "2번 질문에 대한 모범 답변",
      ...
      "${data.content.length}번 질문에 대한 모범 답변"
    ]
  }
  
  🔗 **세부 요구사항:**
  - **personalityScore** (인성 질문 답변 점수): **30~100점 사이의 정수**
  - **jobScore** (직무 질문 답변 점수): **30~100점 사이의 정수**
  - **personalityEval** (인성 질문에 대한 평가): **200자 이내의 문자열**
  - **jobEval** (직무 질문에 대한 평가): **200자 이내의 문자열**
  - **summary** (전체 답변에 대한 총평): **200자 이내의 문자열*
  - **strengths** (전체 답변에 대한 좋은 점): **200자 이내의 문자열*
  - **improvements** (전체 답변에 대한 개선할 점): **200자 이내의 문자열*
  - **recommended** (각 질문에 대한 모범 답변): 각 문자열은 **200자 이내**
  `;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [{ role: "user", content: prompt }],
      });
      return res;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};
