import express from "express";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

// 로그인
router.post("/signin", authController.signin);

// 회원가입
router.post("/signup", authController.signup);

export default router;
