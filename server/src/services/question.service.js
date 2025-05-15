import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 모든 질문 조회 (사용자 ID 기준)
export const getAllQuestions = async (userId = null, pagination = {}, filters = {}) => {
  const { page = 1, pageSize = 10 } = pagination;
  const { sortBy = 'date', bookmarked = false } = filters;
  
  // 기본 쿼리 조건
  const where = {};
  
  // 특정 사용자의 질문만 조회 (userId가 제공된 경우)
  if (userId) {
    where.userId = userId;
  }
  
  // 북마크 필터가 적용된 경우
  if (bookmarked) {
    where.bookmarked = true;
  }
  
  // 정렬 방식 설정
  const orderBy = {};
  if (sortBy === 'date') {
    orderBy.createdAt = 'desc'; // 최신순
  } else if (sortBy === 'title') {
    orderBy.content = 'asc'; // 제목순
  }
  
  // 질문 조회
  const questions = await prisma.question.findMany({
    where,
    orderBy,
    include: {
      interview: true
    },
    skip: (page - 1) * pageSize,
    take: parseInt(pageSize)
  });
  
  // 전체 질문 개수 조회 (페이지네이션 정보 제공용)
  const totalCount = await prisma.question.count({ where });
  
  return {
    questions,
    totalCount,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(totalCount / pageSize)
  };
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
export const getBookmarkedQuestions = async (userId = null) => {
  const where = { bookmarked: true };
  
  // 특정 사용자의 북마크만 조회 (userId가 제공된 경우)
  if (userId) {
    where.userId = userId;
  }
  
  return await prisma.question.findMany({
    where,
    include: {
      interview: true
    }
  });
}; 