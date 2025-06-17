import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";

export const getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;

    const where = {
      userId,
      bookmarked: true,
    };

    try {
      if (req.query.role) {
        where.interview = {
          role: req.query.role,
        };
      }

      if (req.query.type) {
        where.type = req.query.type === "직무" ? "JOB" : "PERSONALITY";
      }
    } catch (filterError) {
      where.interview = undefined;
      where.type = undefined;
    }

    try {
      const totalCount = await prisma.question.count({
        where,
      });

      const questions = await prisma.question.findMany({
        where,
        include: {
          interview: true,
        },
        orderBy: { order: "asc" },
        skip,
        take: pageSize,
      });

      res.status(200).json({
        questions,
        totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      });
    } catch (dbError) {
      return res.status(500).json({
        message: "데이터 조회 중 오류가 발생했습니다.",
        error: dbError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 조회
export const getUserInfo = async (req, res) => {
  try {
    const clientUserId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: clientUserId },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { password, ...userInfo } = user;

    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 업데이트
export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, role, career } = req.body;

    const updateData = {};

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    if (role !== undefined) {
      updateData.role = role;
    }

    if (career !== undefined) {
      updateData.career = career;
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "업데이트할 정보가 제공되지 않았습니다." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      const { password: _, ...userInfo } = updatedUser;

      return res.status(200).json({
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        user: userInfo,
      });
    } catch (updateError) {
      throw updateError;
    }
  } catch (error) {
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 회원 탈퇴
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const password = req.body?.password;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

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
