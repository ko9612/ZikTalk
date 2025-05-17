import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export const getMyBookmarks = async (req, res) => {
  try {
    // 쿼리 파라미터에서 userId를 가져오거나, 로그인된 사용자 ID 사용
    const userId = req.query.userId || req.user?.id;
    
    // userId가 없으면 401 에러 반환
    if (!userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }
    
    // 현재 사용자의 면접만 조회
    const interviews = await prisma.interview.findMany({
      where: {
        userId: userId
      },
      include: {
        questions: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // 현재 사용자의 질문만 조회
    const questions = await prisma.question.findMany({
      where: {
        userId: userId
      },
      include: {
        interview: true
      },
      orderBy: { order: 'asc' }
    });
    
    res.status(200).json({
      interviews: interviews,
      questions: questions
    });
  } catch (error) {
    console.error('북마크 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 정보 조회
export const getUserInfo = async (req, res) => {
  try {
    // 쿼리 파라미터에서 userId를 가져오거나, 로그인된 사용자 ID 사용
    const userId = req.query.userId || req.user?.id;
    
    // userId가 없으면 401 에러 반환
    if (!userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 비밀번호는 제외하고 반환
    const { password, ...userInfo } = user;
    
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (req, res) => {
  try {
    // 인증 확인 - userId가 없으면 401 반환
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }
    
    const { password, role, career } = req.body;
    
    // 업데이트할 데이터 객체 생성
    const updateData = {};
    
    // 비밀번호가 제공된 경우 해싱
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }
    
    // 직무가 제공된 경우 업데이트
    if (role !== undefined) {
      updateData.role = role;
    }
    
    // 경력이 제공된 경우 업데이트 - 정수로 변환해야 함
    if (career !== undefined) {
      // 경력 문자열을 숫자로 변환
      let careerValue = 0;
      
      // 문자열에서 숫자 추출 로직
      if (career === '신입') {
        careerValue = 0;
      } else if (career.includes('년차')) {
        // '1년차', '2년차' 등에서 숫자만 추출
        const match = career.match(/(\d+)/);
        if (match) {
          careerValue = parseInt(match[1], 10);
        }
      } else if (!isNaN(parseInt(career))) {
        // 이미 숫자인 경우 그대로 사용
        careerValue = parseInt(career, 10);
      } else if (career === '5년차 이상') {
        careerValue = 5;
      }
      
      updateData.career = careerValue;
    }
    
    // 업데이트할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '업데이트할 정보가 제공되지 않았습니다.' });
    }
    
    // 먼저 사용자가 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    try {
      // 사용자 정보 업데이트
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      
      // 비밀번호는 제외하고 반환
      const { password: _, ...userInfo } = updatedUser;
      
      return res.status(200).json({ 
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        user: userInfo
      });
    } catch (updateError) {
      console.error('Prisma 업데이트 에러:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
