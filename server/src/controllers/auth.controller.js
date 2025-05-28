import * as authService from "../services/authService.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../utils/prisma.js";

const NODE_ENV = process.env.NODE_ENV;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_COOKIE_EXPIRE =
  Number(process.env.JWT_REFRESH_COOKIE_EXPIRE) || 7 * 24 * 60 * 60;

const handleLoginSuccess = (res, user) => {
  const { userName } = user;
  const { accessToken, refreshToken } = authService.generateTokens(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "None" : "Lax",
    maxAge: JWT_REFRESH_COOKIE_EXPIRE,
  });

  res.status(200).json({ message: "로그인 성공", userName, accessToken });
};

export const signin = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body);

    return handleLoginSuccess(res, user);
  } catch (error) {
    if (error.status === 401) {
      res.status(401).json({ message: error.message });
    } else if (error.status === 404) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "로그인 실패", error: error.message });
    }
  }
};

export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "토큰 없음" });

  try {
    // refreshToken 검증
    const payload = jwt.verify(token, JWT_REFRESH_SECRET);

    // accessToken 재발급
    const accessToken = jwt.sign(
      { userId: payload.userId, userName: payload.userName },
      JWT_SECRET,
      {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
      }
    );

    res.status(200).json({ message: "accessToken 재발급 성공", accessToken });
  } catch (e) {
    console.error("토큰 오류:", e);
    return res.status(401).json({ message: "토큰 오류" });
  }
};

export const kakaoLogin = async (req, res) => {
  const { code } = req.body;

  try {
    const result = await authService.handleKakaoLogin(code);

    if (result.status === "signup") {
      return res.status(200).json({
        status: "signup",
        kakaoUser: result.kakaoUser,
      });
    } else if (result.status === "localUser") {
      return res.status(409).json({
        status: "localUser",
        kakaoUser: result.kakaoUser,
      });
    }

    // 로그인
    return handleLoginSuccess(res, result.user);
  } catch (error) {
    res.status(500).json({ message: "카카오 로그인 실패", error });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.status(200).json({ message: "로그아웃 완료" });
  } catch (e) {
    console.error("로그아웃 오류:", e);
    res.status(500).json({ message: "서버 오류" });
  }
};

export const linkAccount = async (req, res) => {
  try {
    await authService.linkAccountEmail(req.body);

    const { email } = req.body;
    res.status(200).json({ message: "계정 연동 성공", email });
  } catch (error) {
    res.status(500).json({ message: "계정 연동 실패", error: error.message });
  }
};

export const signup = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: "회원가입 성공", user });
  } catch (error) {
    if (error.status === 409) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: "회원가입 실패", error: error.message });
    }
  }
};

export const verification = async (req, res) => {
  const { email } = req.body;
  const verificationCode = authService.generateVerificationCode();
  try {
    await authService.sendVerificationEmail(email, verificationCode);
    return res.status(200).json({
      message: "인증번호가 발송되었습니다.",
      verificationCode,
    });
  } catch (e) {
    res.status(500).json({ message: "인증번호 발송에 실패했습니다." });
  }
};

export const sendResetEmail = async (req, res) => {
  const { email } = req.body;
  const { userId } = req.user;

  const authCode = crypto.randomBytes(20).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분

  // 인증 코드 테이블에 저장
  await prisma.$transaction(async (tx) => {
    // 기존 userId에 해당하는 인증 코드 삭제
    await tx.emailAuth.deleteMany({
      where: {
        userId,
      },
    });

    // 새로운 인증 코드 생성
    await tx.emailAuth.create({
      data: {
        userId,
        authCode,
        expiresAt,
      },
    });
  });

  // 메일 보내기
  try {
    await authService.sendResetPasswordEmail(email, authCode);
    return res.status(200).json({
      message: "비밀번호 재설정 메일이 발송되었습니다.",
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "비밀번호 재설정 메일 발송에 실패했습니다." });
  }
};

export const resetPassword = async (req, res) => {
  const { authCode, newPassword } = req.body;

  if (!authCode || !newPassword) {
    return res
      .status(400)
      .json({ message: "authCode와 newPassword가 필요합니다." });
  }

  try {
    const userAuth = await prisma.emailAuth.findUnique({
      where: { authCode },
    });

    if (!userAuth) {
      return res.status(404).json({ message: "유효하지 않은 코드입니다." });
    }

    const isExpired = new Date(userAuth.expiresAt) < new Date();
    if (isExpired) {
      return res.status(410).json({ message: "인증코드가 만료되었습니다." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userAuth.userId },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.emailAuth.delete({
      where: { authCode },
    });

    return res
      .status(200)
      .json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 에러입니다." });
  }
};
