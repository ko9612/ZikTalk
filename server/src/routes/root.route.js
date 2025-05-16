import express from "express";
import questionRouter from "./question.route.js";
import interviewRouter from "./interview.route.js";
import mypageRouter from "./mypage.route.js";
import authRouter from "./auth.route.js";

import path from "path";
import { fileURLToPath } from "url";
import recordRouter from "./record.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// get 요청이 "/" 경로로 들어올 때 호출되는 핸들러
router.get("/", (req, res) => {
  res.json({ message: "✅ API is working!" });
});

// 로그인, 회원가입
router.use("/", authRouter);

// 질문 라우터 연결
router.use("/questions", questionRouter);

// 마이페이지 라우터 연결
router.use("/mypage", mypageRouter);

// 면접 라우터 연결
router.use("/interview", interviewRouter);

// 녹화
// 정적 파일 제공 (녹화 영상 접근용)
router.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// 녹화 라우터 연결
router.use("/record", recordRouter); // ex) POST /api/upload

export default router;
