import prisma from "./utils/prisma.js";

// 모든 질문을 북마크로 설정
async function updateQuestions() {
  try {
    console.log("질문 북마크 업데이트 시작...");

    // 모든 질문 조회
    const questions = await prisma.question.findMany();
    console.log(`질문 수: ${questions.length}`);

    // 각 질문의 북마크 상태를 true로 업데이트
    let count = 0;
    for (const question of questions) {
      try {
        await prisma.question.update({
          where: { id: question.id },
          data: { bookmarked: true },
        });
        console.log(`질문 ID ${question.id} 북마크 설정 완료`);
        count++;
      } catch (err) {
        console.error(`질문 ID ${question.id} 업데이트 실패:`, err);
      }
    }

    console.log(`총 ${count}개의 질문이 북마크 처리되었습니다.`);
  } catch (error) {
    console.error("질문 북마크 업데이트 중 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 함수 실행
updateQuestions();
