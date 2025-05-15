const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testUpdate() {
  try {
    console.log('사용자 업데이트 테스트 시작...');
    console.log('Prisma 클라이언트 초기화됨');
    
    try {
      // 모든 사용자 조회 시도
      console.log('모든 사용자 조회 시도...');
      const allUsers = await prisma.user.findMany();
      console.log('총 사용자 수:', allUsers.length);
      console.log('사용자 목록:', allUsers.map(u => ({ id: u.id, name: u.name })));
      
      // 특정 사용자 조회 시도
      console.log('test 사용자 조회 시도...');
      const testUser = await prisma.user.findUnique({
        where: { id: 'test' }
      });
      
      if (!testUser) {
        console.log('test 사용자를 찾을 수 없습니다.');
        return;
      }
      
      console.log('현재 test 사용자 정보:', testUser);
      
      // 사용자 정보 업데이트 시도
      console.log('사용자 정보 업데이트 시도...');
      const updatedUser = await prisma.user.update({
        where: { id: 'test' },
        data: {
          role: '자바 개발자',
          career: 1
        }
      });
      
      console.log('업데이트된 사용자 정보:', updatedUser);
      console.log('업데이트 성공!');
    } catch (err) {
      console.error('Prisma 작업 중 오류 발생:', err);
    }
  } catch (error) {
    console.error('전체 프로세스 오류:', error);
  } finally {
    console.log('데이터베이스 연결 종료 중...');
    await prisma.$disconnect();
    console.log('데이터베이스 연결 종료됨');
  }
}

console.log('스크립트 시작');
testUpdate()
  .then(() => console.log('스크립트 실행 완료'))
  .catch(e => console.error('스크립트 실행 중 오류:', e)); 