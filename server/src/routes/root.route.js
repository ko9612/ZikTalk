import express from "express";
import questionRouter from "./question.route.js";
import interviewRouter from "./interview.route.js";
import mypageRouter from "./mypage.route.js";

const router = express.Router();

// get 요청이 "/" 경로로 들어올 때 호출되는 핸들러
router.get("/", (req, res) => {
  res.json({ message: "✅ API is working!" });
});

// 질문 라우터 연결
router.use("/questions", questionRouter);

// 마이페이지 라우터 연결
router.use("/mypage", mypageRouter);

// 면접 라우터 연결
router.use("/interview", interviewRouter);

export default router;
