import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 모든 질문 조회
export const getAllQuestions = async () => {
  return await prisma.question.findMany({
    include: {
      interview: true
    }
  });
};

// ID로 질문 조회
export const getQuestionById = async (id) => {
  return await prisma.question.findUnique({
    where: { id },
    include: {
      interview: true
    }
  });
};

// 면접 ID로 질문 조회
export const getQuestionsByInterviewId = async (interviewId) => {
  return await prisma.question.findMany({
    where: { interviewId },
    orderBy: { order: 'asc' }
  });
};

// 새 질문 생성
export const createQuestion = async (data) => {
  return await prisma.question.create({
    data
  });
};

// 여러 질문 한 번에 생성
export const createManyQuestions = async (questions) => {
  return await prisma.question.createMany({
    data: questions
  });
};

// 질문 업데이트
export const updateQuestion = async (id, data) => {
  return await prisma.question.update({
    where: { id },
    data
  });
};

// 질문 삭제
export const deleteQuestion = async (id) => {
  return await prisma.question.delete({
    where: { id }
  });
};

// 북마크 토글
export const toggleBookmark = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id }
  });
  
  if (!question) return null;
  
  return await prisma.question.update({
    where: { id },
    data: { bookmarked: !question.bookmarked }
  });
};

// 질문 유형별 조회
export const getQuestionsByType = async (type) => {
  return await prisma.question.findMany({
    where: { type },
    include: {
      interview: true
    }
  });
};

// 북마크된 질문 조회
export const getBookmarkedQuestions = async () => {
  return await prisma.question.findMany({
    where: { bookmarked: true },
    include: {
      interview: true
    }
  });
}; 