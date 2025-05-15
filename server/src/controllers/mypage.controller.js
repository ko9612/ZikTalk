import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export const getMyBookmarks = async (req, res) => {
  try {
    console.log('북마크 조회 API 호출됨');
    
    // 테스트를 위해 'test' 사용자 ID 사용 (실제로는 인증 토큰에서 추출한 사용자 ID 사용)
    const userId = req.user?.id || 'test';
    console.log('북마크 조회 - 사용자 ID:', userId);
    
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
    
    console.log('사용자의 면접 조회:', JSON.stringify(interviews.length, null, 2));
    
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
    
    console.log('사용자의 질문 조회:', JSON.stringify(questions.length, null, 2));
    
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
    // 실제 인증 시에는 req.user.id를 통해 현재 로그인된 사용자 ID를 사용
    // 테스트를 위해 'test' 사용자 정보 조회
    const userId = req.user?.id || 'test'; // 인증된 요청이면 req.user.id, 아니면 'test'
    
    console.log('사용자 정보 조회 API 호출됨. 사용자 ID:', userId);
    
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
  console.log(' POST /api/mypage/user/update 요청 수신됨');
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request body:', req.body);
  
  try {
    // 실제 인증 시에는 req.user.id를 통해 현재 로그인된 사용자 ID를 사용
    const userId = req.user?.id || 'test'; // 인증된 요청이면 req.user.id, 아니면 'test'
    
    console.log('사용자 정보 업데이트 API 호출됨. 사용자 ID:', userId);
    console.log('클라이언트에서 받은 데이터:', JSON.stringify(req.body, null, 2));
    
    const { password, role, career } = req.body;
    
    // 업데이트할 데이터 객체 생성
    const updateData = {};
    
    // 비밀번호가 제공된 경우 해싱
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
      console.log('비밀번호 해싱 완료');
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
      console.log('업데이트할 데이터가 없음');
      return res.status(400).json({ message: '업데이트할 정보가 제공되지 않았습니다.' });
    }
    
    console.log('업데이트할 데이터:', JSON.stringify(updateData, null, 2));
    
    // 먼저 사용자가 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      console.log(`사용자 ID ${userId}를 찾을 수 없음`);
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    console.log('기존 사용자 정보:', JSON.stringify({
      id: existingUser.id,
      role: existingUser.role,
      career: existingUser.career
    }, null, 2));
    
    // [디버그] Prisma 쿼리 파라미터 로깅
    console.log('Prisma 업데이트 시도 - where 조건:', { id: userId });
    console.log('Prisma 업데이트 시도 - 업데이트 데이터:', updateData);
    
    try {
      // 사용자 정보 업데이트
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      
      console.log('업데이트 성공 - 결과:', JSON.stringify({
        id: updatedUser.id,
        role: updatedUser.role,
        career: updatedUser.career
      }, null, 2));
      
      // 비밀번호는 제외하고 반환
      const { password: _, ...userInfo } = updatedUser;
      
      return res.status(200).json({ 
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        user: userInfo
      });
    } catch (updateError) {
      console.error('Prisma 업데이트 에러:', updateError);
      
      if (updateError.code) {
        console.error('Prisma 에러 코드:', updateError.code);
      }
      if (updateError.meta) {
        console.error('Prisma 에러 메타데이터:', updateError.meta);
      }
      
      // 스택 트레이스 로깅
      console.error('스택 트레이스:', updateError.stack);
      
      throw updateError;
    }
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    // 에러 유형에 따른 상세 로깅
    if (error.code) {
      console.error('Prisma 에러 코드:', error.code);
    }
    if (error.meta) {
      console.error('Prisma 에러 메타데이터:', error.meta);
    }
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
