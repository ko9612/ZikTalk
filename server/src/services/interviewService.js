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

// 아래는 예시코드

import prisma from "../utils/prisma.js";

// 인터뷰 생성
export const createInterview = async ({ userId, question, answer }) => {
  if (!userId || !question || !answer) {
    throw new Error("모든 필드가 필요합니다.");
  }

  const interview = await prisma.interview.create({
    data: { userId, question, answer },
  });

  return { id: interview.id, question: interview.question, answer: interview.answer };
};

// 인터뷰 조회 (단일)
export const getInterviewById = async (interviewId) => {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { user: { select: { email: true } } },
  });

  if (!interview) throw new Error("해당 인터뷰를 찾을 수 없습니다.");

  return interview;
};

// 인터뷰 목록 조회 (유저별)
export const getInterviewsByUser = async (userId) => {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      question: true,
      answer: true,
      feedback: true,
      createdAt: true,
    },
  });

  return interviews;
};

// 인터뷰 수정 (피드백 추가)
export const updateInterviewFeedback = async (interviewId, feedback) => {
  if (!feedback) throw new Error("피드백이 필요합니다.");

  const interview = await prisma.interview.update({
    where: { id: interviewId },
    data: { feedback },
  });

  return interview;
};

// 인터뷰 삭제
export const deleteInterview = async (interviewId) => {
  await prisma.interview.delete({
    where: { id: interviewId },
  });

  return { message: "인터뷰가 삭제되었습니다." };
};

