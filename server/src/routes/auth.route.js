import express from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  checkEmailExists,
  checkEmailUserId,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// 로그인
router.post("/signin", authController.signin);

// 카카오 로그인
router.post("/kakao-login", authController.kakaoLogin);

// 로그아웃
router.post("/logout", authController.logout);

// refresh token
router.post("/silent-refresh", authController.refreshToken);

// 계정 연동
router.post("/link-account", authController.linkAccount);

// 회원가입
router.post("/signup", authController.signup);

// 이메일 인증
router.post("/verification", checkEmailExists, authController.verification);

// 비밀번호 재설정 이메일 보내기
router.post(
  "/reset-password/request",
  checkEmailUserId,
  authController.sendResetEmail
);

// 비밀번호 재설정
router.post("/reset-password/confirm", authController.resetPassword);

export default router;
