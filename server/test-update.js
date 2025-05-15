import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testUpdate() {
  try {
    console.log('사용자 업데이트 테스트 시작...');
    
    // 현재 사용자 정보 조회
    const beforeUser = await prisma.user.findUnique({
      where: { id: 'test' }
    });
    
    console.log('업데이트 전 사용자 정보:', beforeUser);
    
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: 'test' },
      data: {
        role: '자바 개발자',
        career: 1
      }
    });
    
    console.log('업데이트 후 사용자 정보:', updatedUser);
    console.log('업데이트 성공!');
    
  } catch (error) {
    console.error('업데이트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate(); 