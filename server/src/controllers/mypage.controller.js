import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMyBookmarks = async (req, res) => {
  try {
    console.log('북마크 조회 API 호출됨');
    
    // 모든 면접 조회 (북마크 상태와 관계없이)
    const interviews = await prisma.interview.findMany({
      include: {
        questions: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('모든 면접 조회:', JSON.stringify(interviews.length, null, 2));
    
    // 모든 질문 조회 (북마크 상태와 관계없이)
    const questions = await prisma.question.findMany({
      include: {
        interview: true
      },
      orderBy: { order: 'asc' }
    });
    
    console.log('모든 질문 조회:', JSON.stringify(questions.length, null, 2));
    
    res.status(200).json({
      interviews: interviews,
      questions: questions
    });
  } catch (error) {
    console.error('북마크 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
