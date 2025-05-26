import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";

// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });

export const getMyBookmarks = async (req, res) => {
  try {
    // 쿼리 파라미터에서 userId를 가져오거나, 로그인된 사용자 ID 사용
    const userId = req.user.userId;

    // 페이지네이션 파라미터
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;

    // userId가 없으면 401 에러 반환
    // if (!userId) {
    //   return res.status(401).json({ message: "인증이 필요합니다." });
    // }

    // 기본 필터링 조건 - 사용자 ID 및 북마크 상태
    const where = {
      userId,
      bookmarked: true,
    };

    try {
      // 직군/직무 필터
      if (req.query.role) {
        where.interview = {
          role: req.query.role,
        };
      }

      // 질문 유형 필터
      if (req.query.type) {
        where.type = req.query.type === "직무" ? "JOB" : "PERSONALITY";
      }
    } catch (filterError) {
      console.error("[서버] 필터 적용 중 오류:", filterError);
      // 필터 오류 발생 시 기본 조건만 사용
      where.interview = undefined;
      where.type = undefined;
    }

    try {
      // 총 질문 수 조회 (페이지네이션용)
      const totalCount = await prisma.question.count({
        where,
      });

      // 현재 페이지 데이터 조회
      const questions = await prisma.question.findMany({
        where,
        include: {
          interview: true,
        },
        orderBy: { order: "asc" },
        skip,
        take: pageSize,
      });

      // 페이지네이션 정보 포함하여 응답
      res.status(200).json({
        questions,
        totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      });
    } catch (dbError) {
      console.error("[서버] 데이터베이스 쿼리 오류:", dbError);
      return res.status(500).json({
        message: "데이터 조회 중 오류가 발생했습니다.",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("북마크 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 조회
export const getUserInfo = async (req, res) => {
  try {
    // 쿼리 파라미터에서 userId를 가져오기
    const clientUserId = req.user.userId;

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: clientUserId },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호는 제외하고 반환
    const { password, ...userInfo } = user;

    res.status(200).json(userInfo);
  } catch (error) {
    console.error("[서버] 사용자 정보 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (req, res) => {
  try {
    // 토큰에서 사용자 ID 가져오기
    const userId = req.user.userId;

    // if (!userId) {
    //   console.log("[서버] 인증 실패: 토큰에서 사용자 ID를 찾을 수 없음");
    //   return res.status(401).json({ message: "인증이 필요합니다." });
    // }

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

    // 경력이 제공된 경우 업데이트
    if (career !== undefined) {
      updateData.career = career;
    }

    // 업데이트할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "업데이트할 정보가 제공되지 않았습니다." });
    }

    // 먼저 사용자가 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
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
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        user: userInfo,
      });
    } catch (updateError) {
      console.error("[서버] Prisma 업데이트 에러:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("[서버] 사용자 정보 업데이트 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 회원 탈퇴
export const deleteUserAccount = async (req, res) => {
  try {
    // 토큰에서 사용자 ID 가져오기
    const userId = req.user.userId;
    console.log("[서버] 토큰에서 가져온 사용자 ID:", userId);

    // if (!userId) {
    //   console.log("[서버] 인증 실패: 토큰에서 사용자 ID를 찾을 수 없음");
    //   return res.status(401).json({ message: "인증이 필요합니다." });
    // }

    // 비밀번호 확인
    const password = req.body?.password;

    // 먼저 사용자가 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 확인이 제공된 경우 검증
    if (password) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "비밀번호가 일치하지 않습니다." });
      }
    }

    try {
      // 트랜잭션 사용하여 원자적으로 데이터 삭제 처리
      await prisma.$transaction(async (prisma) => {
        // 1. 사용자의 질문 삭제
        const deletedQuestions = await prisma.question.deleteMany({
          where: { userId },
        });

        // 2. 사용자의 면접 삭제
        const deletedInterviews = await prisma.interview.deleteMany({
          where: { userId },
        });

        // 3. 사용자 계정 삭제
        await prisma.user.delete({
          where: { id: userId },
        });
      });

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
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
