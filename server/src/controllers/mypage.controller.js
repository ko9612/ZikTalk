import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
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
        userId: userId,
      },
      include: {
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 현재 사용자의 질문만 조회
    const questions = await prisma.question.findMany({
      where: {
        userId: userId,
      },
      include: {
        interview: true,
      },
      orderBy: { order: "asc" },
    });

    res.status(200).json({
      interviews: interviews,
      questions: questions,
    });
  } catch (error) {
    console.error("북마크 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 조회
export const getUserInfo = async (req, res) => {
  try {
    console.log("\n[서버] ==== 사용자 정보 조회 요청 시작 ====");
    console.log("[서버] 요청 헤더:", JSON.stringify(req.headers));
    console.log("[서버] 요청 쿼리:", JSON.stringify(req.query));
    console.log("[서버] 토큰 userId 확인:", req.user?.id);

    // 쿼리 파라미터에서 userId를 가져오기
    const clientUserId = req.query.userId;
    console.log("[서버] 클라이언트 userId 확인:", clientUserId);

    // userId가 없으면 401 에러 반환
    if (!clientUserId) {
      console.log("[서버] 인증 실패: 쿼리에 userId 없음");
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    // 토큰의 userId와 클라이언트 userId 비교 (로그용)
    const tokenUserId = req.user?.id;
    if (tokenUserId && tokenUserId !== clientUserId) {
      console.log(`[서버] 주의: 클라이언트 userId(${clientUserId})와 토큰 userId(${tokenUserId})가 다릅니다`);
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: clientUserId },
    });

    if (!user) {
      console.log("[서버] 사용자 조회 실패: 존재하지 않는 사용자 ID");
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호는 제외하고 반환
    const { password, ...userInfo } = user;
    
    console.log("[서버] 사용자 정보 조회 성공:", userInfo.id);
    console.log("[서버] ==== 사용자 정보 조회 요청 완료 ====\n");

    res.status(200).json(userInfo);
  } catch (error) {
    console.error("[서버] 사용자 정보 조회 오류:", error);
    console.log("[서버] ==== 사용자 정보 조회 요청 실패 ====\n");
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (req, res) => {
  try {
    console.log("\n[서버] ==== 사용자 정보 업데이트 요청 시작 ====");
    console.log("[서버] 요청 헤더:", JSON.stringify(req.headers));
    console.log("[서버] 요청 바디:", JSON.stringify(req.body));
    console.log("[서버] 토큰 userId 확인:", req.user?.id);

    // 요청 본문에서 userId 가져오기
    const clientUserId = req.body.userId;
    console.log("[서버] 클라이언트 userId 확인:", clientUserId);

    // 인증 확인 - 본문의 userId 사용
    if (!clientUserId) {
      console.log("[서버] 인증 실패: 요청 본문에 userId 없음");
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    // 토큰의 userId와 클라이언트 userId 비교 (로그용)
    const tokenUserId = req.user?.id;
    if (tokenUserId && tokenUserId !== clientUserId) {
      console.log(`[서버] 주의: 클라이언트 userId(${clientUserId})와 토큰 userId(${tokenUserId})가 다릅니다`);
    }

    const { password, role, career } = req.body;
    console.log("[서버] 수정 요청 데이터:", {
      role,
      career,
      hasPassword: !!password,
    });

    // 업데이트할 데이터 객체 생성
    const updateData = {};

    // 비밀번호가 제공된 경우 해싱
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
      console.log("[서버] 비밀번호 해싱 완료");
    }

    // 직무가 제공된 경우 업데이트
    if (role !== undefined) {
      updateData.role = role;
      console.log("[서버] 직무 업데이트:", role);
    }

    // 경력이 제공된 경우 업데이트 - 정수로 변환해야 함
    if (career !== undefined) {
      // 경력 문자열을 숫자로 변환
      let careerValue = 0;

      // career 타입 체크 및 처리
      if (typeof career === 'number') {
        // 이미 숫자인 경우 그대로 사용
        careerValue = career;
        console.log(`[서버] 경력 타입: 숫자, 값: ${career}`);
      } else if (typeof career === 'string') {
        // 문자열인 경우 변환 로직 적용
        if (career === "신입") {
          careerValue = 0;
        } else if (career.includes("년차")) {
          // '1년차', '2년차' 등에서 숫자만 추출
          const match = career.match(/(\d+)/);
          if (match) {
            careerValue = parseInt(match[1], 10);
          }
        } else if (!isNaN(parseInt(career))) {
          // 숫자 문자열인 경우 변환
          careerValue = parseInt(career, 10);
        } else if (career === "5년차 이상") {
          careerValue = 5;
        }
        console.log(`[서버] 경력 타입: 문자열, 값: ${career}`);
      } else {
        console.log(`[서버] 경력 타입: ${typeof career}, 값: ${career}`);
      }

      updateData.career = careerValue;
      console.log(`[서버] 경력 변환: ${career} → ${careerValue}`);
    }

    // 업데이트할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      console.log("[서버] 업데이트할 데이터 없음");
      return res
        .status(400)
        .json({ message: "업데이트할 정보가 제공되지 않았습니다." });
    }

    // 먼저 사용자가 존재하는지 확인 (본문의 userId 사용)
    const existingUser = await prisma.user.findUnique({
      where: { id: clientUserId },
    });

    if (!existingUser) {
      console.log("[서버] 사용자 조회 실패: 존재하지 않는 사용자 ID");
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    console.log("[서버] 사용자 조회 성공. 정보 업데이트 시작:", clientUserId);
    console.log("[서버] 업데이트할 데이터:", updateData);

    try {
      // 사용자 정보 업데이트 (본문의 userId 사용)
      const updatedUser = await prisma.user.update({
        where: { id: clientUserId },
        data: updateData,
      });

      // 비밀번호는 제외하고 반환
      const { password: _, ...userInfo } = updatedUser;

      console.log("[서버] 사용자 정보 업데이트 성공:", userInfo.id);
      console.log("[서버] ==== 사용자 정보 업데이트 요청 완료 ====\n");

      return res.status(200).json({
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        user: userInfo,
      });
    } catch (updateError) {
      console.error("[서버] Prisma 업데이트 에러:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("[서버] 사용자 정보 업데이트 오류:", error);
    console.log("[서버] ==== 사용자 정보 업데이트 요청 실패 ====\n");
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 회원 탈퇴
export const deleteUserAccount = async (req, res) => {
  try {
    console.log("\n[서버] ==== 회원 탈퇴 요청 시작 ====");
    console.log("[서버] 요청 헤더:", JSON.stringify(req.headers));
    console.log("[서버] 요청 바디:", JSON.stringify(req.body));
    console.log("[서버] 토큰 userId 확인:", req.user?.id);

    // 요청 본문에서 userId 가져오기
    const clientUserId = req.body.userId;
    console.log("[서버] 클라이언트 userId 확인:", clientUserId);

    // 인증 확인 - 본문의 userId 사용
    if (!clientUserId) {
      console.log("[서버] 인증 실패: 요청 본문에 userId 없음");
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    // 토큰의 userId와 클라이언트 userId 비교 (로그용)
    const tokenUserId = req.user?.id;
    if (tokenUserId && tokenUserId !== clientUserId) {
      console.log(`[서버] 주의: 클라이언트 userId(${clientUserId})와 토큰 userId(${tokenUserId})가 다릅니다`);
    }

    // 비밀번호 확인 (추가 보안) - req.body가 undefined일 수 있으므로 안전하게 처리
    const password = req.body?.password;
    console.log("[서버] 비밀번호 제공 여부:", !!password);

    // 먼저 사용자가 존재하는지 확인 (본문의 userId 사용)
    const existingUser = await prisma.user.findUnique({
      where: { id: clientUserId },
    });

    if (!existingUser) {
      console.log("[서버] 사용자 조회 실패: 존재하지 않는 사용자 ID");
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    console.log("[서버] 사용자 조회 성공:", clientUserId);

    // 비밀번호 확인이 제공된 경우 검증 (추가 보안)
    if (password) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordValid) {
        console.log("[서버] 비밀번호 검증 실패");
        return res
          .status(401)
          .json({ message: "비밀번호가 일치하지 않습니다." });
      }
      console.log("[서버] 비밀번호 검증 성공");
    }

    try {
      console.log("[서버] 회원 탈퇴 처리 시작 - 트랜잭션 시작");
      // 트랜잭션 사용하여 원자적으로 데이터 삭제 처리
      await prisma.$transaction(async (prisma) => {
        // 1. 사용자의 질문 삭제 (외래 키 문제로 가장 먼저 삭제)
        const deletedQuestions = await prisma.question.deleteMany({
          where: { userId: clientUserId },
        });
        console.log(`[서버] 1단계: ${deletedQuestions.count}개 질문 삭제 완료`);

        // 2. 사용자의 면접 삭제 (질문 삭제 후 면접 삭제)
        const deletedInterviews = await prisma.interview.deleteMany({
          where: { userId: clientUserId },
        });
        console.log(`[서버] 2단계: ${deletedInterviews.count}개 면접 삭제 완료`);

        // 3. 사용자 계정 삭제 (관련 데이터가 모두 삭제된 후 계정 삭제)
        await prisma.user.delete({
          where: { id: clientUserId },
        });
        console.log("[서버] 3단계: 사용자 계정 삭제 완료");
      });

      console.log("[서버] 회원 탈퇴 성공적으로 완료");
      console.log("[서버] ==== 회원 탈퇴 요청 완료 ====\n");

      return res.status(200).json({
        success: true,
        message: "회원 탈퇴가 성공적으로 처리되었습니다.",
      });
    } catch (deleteError) {
      console.error("[서버] Prisma 삭제 에러:", deleteError);
      if (deleteError.code === "P2003") {
        return res.status(500).json({
          message:
            "참조 무결성 제약조건으로 인해 삭제할 수 없습니다. 관련 데이터를 먼저 삭제해주세요.",
        });
      }
      throw deleteError;
    }
  } catch (error) {
    console.error("[서버] 회원 탈퇴 처리 오류:", error);
    console.log("[서버] ==== 회원 탈퇴 요청 실패 ====\n");
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
