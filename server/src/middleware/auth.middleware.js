// JWT 인증과 같은 요청 검증 처리
// 인증이 필요한 api에서 토큰 검증 수행
// 토큰 생성 및 검증, 인증 미들웨어 여기서 한 번에 처리 or src/utils/jwt.js 분리해서 토큰 생성,검증은 따로 하던 지 자유롭게 하시면 될 듯!

import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

// 인증 미들웨어
export const authenticate = (req, res, next) => {
  try {
    // 헤더에서 토큰 가져오기
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    // "Bearer 토큰" 형식에서 토큰 추출
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "유효한 인증 형식이 아닙니다." });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 요청 객체에 사용자 정보 추가
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "인증 토큰이 만료되었습니다." });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "유효하지 않은 인증 토큰입니다." });
    }

    console.error("인증 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 이메일 중복 확인
export const checkEmailExists = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해 주세요." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "사용 중인 이메일입니다." });
    }
    next();
  } catch (e) {
    console.error("DB 조회 오류:", e);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
