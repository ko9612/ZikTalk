import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { checkEmailExists } from "../middleware/auth.middleware.js";

const router = express.Router();

// 로그인
router.post("/signin", authController.signin);

// 회원가입
router.post("/signup", authController.signup);

// 이메일 인증
router.post("/verification", checkEmailExists, authController.verification);

export default router;
