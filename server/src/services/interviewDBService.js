// 1. 비즈니스 로직 처리
// 비즈니스 규칙을 기반으로 데이터를 처리
// 데이터 검증, 권한 체크, 복잡한 계산 로직 등을 포함

// 2. 데이터베이스 상호작용
// Prisma 또는 다른 데이터베이스 클라이언트와 직접 상호작용하여 데이터를 생성, 조회, 수정, 삭제
// 트랜잭션 처리나 복잡한 데이터 연관 관계를 관리

// 3. 에러 처리
// 데이터베이스와의 상호작용 중 발생하는 에러를 명확하게 정의하여 컨트롤러로 전달

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 모든 면접 조회
export const getAllInterviews = async () => {
  return await prisma.interview.findMany({
    include: {
      user: true,
      questions: true,
    },
  });
};

// 모든 면접을 조회하되, 각 면접마다 첫 번째 질문만 포함
export const getAllInterviewsWithFirstQuestion = async () => {
  // 모든 면접을 가져오되, 각 면접마다 첫 번째 질문만 포함
  return await prisma.interview.findMany({
    include: {
      questions: {
        take: 1,  // 각 면접당 첫 번째 질문만 가져옴
        orderBy: { order: 'asc' }
      }
    }
  });
};

// ID로 면접 조회
export const getInterviewById = async (id) => {
  return await prisma.interview.findUnique({
    where: { id },
    include: {
      user: true,
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });
};

// 사용자 ID로 면접 조회
export const getInterviewsByUserId = async (userId) => {
  return await prisma.interview.findMany({
    where: { userId },
    include: {
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// 새 면접 생성
export const createInterview = async (data) => {
  /*
  return await prisma.interview.create({
    data,
    //   : {
    //   userId: "test", // 👉 여기에 실제 유저 ID 넣어야 함
    //   role: "프론트엔드",
    //   totalScore: 95,
    //   summary: "전반적으로 매우 우수한 인터뷰",
    //   strengths: "논리적인 설명, 기술 스택 이해도",
    //   improvements: "협업 경험을 더 강조할 필요 있음",
    //   personalityScore: 45,
    //   personalityEval: "친절하고 명확하게 답변함",
    //   jobScore: 50,
    //   jobEval: "React, Zustand에 대한 이해가 뛰어남",
    //   bookmarked: false,
    // },
  });
  */
  const { questions, ...interviewData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. 면접 생성
    const interview = await tx.interview.create({
      data: interviewData,
    });

    // 2. 질문이 있으면 질문들도 생성
    if (questions && questions.length > 0) {
      const questionsWithInterviewId = questions.map((question, index) => ({
        ...question,
        interviewId: interview.id,
        order: index + 1,
      }));

      await tx.question.createMany({
        data: questionsWithInterviewId,
      });
    }

    // 3. 생성된 면접과 질문들 함께 반환
    return await tx.interview.findUnique({
      where: { id: interview.id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });
  });
};

// 면접 업데이트
export const updateInterview = async (id, data) => {
  return await prisma.interview.update({
    where: { id },
    data,
    include: {
      questions: true,
    },
  });
};

// 면접 삭제
export const deleteInterview = async (id) => {
  // 트랜잭션을 사용하여 면접과 관련된 질문들을 함께 삭제
  return await prisma.$transaction(async (tx) => {
    // 1. 관련된 질문 삭제
    await tx.question.deleteMany({
      where: { interviewId: id },
    });

    // 2. 면접 삭제
    return await tx.interview.delete({
      where: { id },
    });
  });
};

// 여러 면접 한 번에 삭제 (배치 삭제)
export const batchDeleteInterviews = async (ids) => {
  if (!ids || ids.length === 0) {
    return { count: 0 };
  }
  
  // 트랜잭션을 사용하여 모든 면접과 질문을 원자적으로 삭제
  return await prisma.$transaction(async (tx) => {
    // 1. 관련된 모든 질문 삭제
    const deletedQuestions = await tx.question.deleteMany({
      where: {
        interviewId: {
          in: ids
        }
      }
    });
    
    // 2. 면접들 삭제
    const deletedInterviews = await tx.interview.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    
    return {
      deletedInterviews: deletedInterviews.count,
      deletedQuestions: deletedQuestions.count
    };
  });
};

// 북마크 토글
export const toggleBookmark = async (id) => {
  const interview = await prisma.interview.findUnique({
    where: { id },
  });

  if (!interview) return null;

  return await prisma.interview.update({
    where: { id },
    data: { bookmarked: !interview.bookmarked },
  });
};

// 직무별 면접 조회
export const getInterviewsByRole = async (role) => {
  return await prisma.interview.findMany({
    where: { role },
    include: {
      user: true,
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// 북마크된 면접 조회
export const getBookmarkedInterviews = async () => {
  return await prisma.interview.findMany({
    where: { bookmarked: true },
    include: {
      user: true,
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
