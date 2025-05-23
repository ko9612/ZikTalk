import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { checkEmailExists } from "../middleware/auth.middleware.js";

const router = express.Router();

// 로그인
router.post("/signin", authController.signin);

// 로그아웃
router.post("/logout", authController.logout);

// refresh token 재발급
router.post("/refresh", authController.refreshToken);

// 회원가입
router.post("/signup", authController.signup);

// 이메일 인증
router.post("/verification", checkEmailExists, authController.verification);

export default router;
