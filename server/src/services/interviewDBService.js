import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 인터뷰 페이지 접근 시, 유저 데이터 조회
export const getInterviewUserInfo = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      career: true,
      role: true,
    },
  });
};

// 모든 면접 조회
export const getAllInterviews = async (userId = null) => {
  const where = userId ? { userId } : {};

  return await prisma.interview.findMany({
    where,
    include: {
      user: true,
      questions: true,
    },
  });
};

// 모든 면접을 조회하되, 각 면접마다 첫 번째 질문만 포함
export const getAllInterviewsWithFirstQuestion = async (
  userId = null,
  pagination = {},
  filters = {}
) => {
  const { page = 1, pageSize = 6 } = pagination;
  const { sortBy = "date", bookmarked = false } = filters;

  // 기본 쿼리 조건
  const where = {};

  // 특정 사용자의 면접만 조회 (userId가 제공된 경우)
  if (userId) {
    where.userId = userId;
  }

  // 북마크 필터가 적용된 경우
  if (bookmarked) {
    where.bookmarked = true;
  }

  // 정렬 설정
  const orderBy = {};
  if (sortBy === "date") {
    orderBy.createdAt = "desc"; // 최신순
  } else if (sortBy === "score") {
    orderBy.totalScore = "desc"; // 점수순
  }

  // 면접 조회
  const interviews = await prisma.interview.findMany({
    where,
    include: {
      questions: {
        take: 1, // 각 면접당 첫 번째 질문만 가져옴
        orderBy: { order: "asc" },
      },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: parseInt(pageSize),
  });

  // 전체 면접 개수 조회 (페이지네이션 정보 제공용)
  const totalCount = await prisma.interview.count({ where });

  return {
    interviews,
    totalCount,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(totalCount / pageSize),
  };
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
  const { questions, userId, interviewId, ...interviewData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. 면접 생성
    const interview = await tx.interview.create({
      data: { id: interviewId || undefined, userId, ...interviewData },
    });

    // 2. 질문이 있으면 질문들도 생성
    if (questions && questions.length > 0) {
      const questionsWithInterviewId = questions.map((question, index) => ({
        ...question,
        interviewId: interview.id,
        userId,
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
export const batchDeleteInterviews = async (ids, userId) => {
  if (!ids || ids.length === 0 || !userId) {
    return { deletedInterviews: 0, deletedQuestions: 0 };
  }

  // 트랜잭션을 사용하여 모든 면접과 질문을 원자적으로 삭제
  return await prisma.$transaction(async (tx) => {
    // 0. 해당 사용자의 면접 ID만 필터링
    const userInterviews = await tx.interview.findMany({
      where: {
        id: { in: ids },
        userId: userId,
      },
      select: { id: true },
    });

    const userInterviewIds = userInterviews.map((interview) => interview.id);

    if (userInterviewIds.length === 0) {
      return { deletedInterviews: 0, deletedQuestions: 0 };
    }

    // 1. 관련된 모든 질문 삭제
    const deletedQuestions = await tx.question.deleteMany({
      where: {
        interviewId: {
          in: userInterviewIds,
        },
      },
    });

    // 2. 면접들 삭제
    const deletedInterviews = await tx.interview.deleteMany({
      where: {
        id: {
          in: userInterviewIds,
        },
        userId: userId,
      },
    });

    return {
      deletedInterviews: deletedInterviews.count,
      deletedQuestions: deletedQuestions.count,
    };
  });
};

// 북마크 토글
export const toggleBookmark = async (id, bookmarked, userId) => {
  // 면접이 존재하고 해당 사용자의 면접인지 확인
  const interview = await prisma.interview.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!interview) return null;

  // 클라이언트에서 전달한 bookmarked 값을 사용하거나, 없으면 현재 상태 반전
  const newBookmarkState =
    bookmarked !== undefined ? bookmarked : !interview.bookmarked;

  return await prisma.interview.update({
    where: { id },
    data: { bookmarked: newBookmarkState },
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
export const getBookmarkedInterviews = async (userId = null) => {
  const where = { bookmarked: true };

  // 특정 사용자의 북마크만 조회 (userId가 제공된 경우)
  if (userId) {
    where.userId = userId;
  }

  return await prisma.interview.findMany({
    where,
    include: {
      user: true,
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
