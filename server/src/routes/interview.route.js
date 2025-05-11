// express router 정의
// api endpoint 정의 & 컨트롤러 함수와 연결
// 컨트롤러와 클라이언트 사이의 중간다리 역할

// 아래는 예시코드 (gpt)
import express from "express";
import * as InterviewController from "../controllers/interviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// 인터뷰 생성
router.post("/interview", authenticate, InterviewController.createInterview);

// 단일 인터뷰 조회
router.get(
  "/interview/:id",
  authenticate,
  InterviewController.getInterviewById
);

// 유저별 인터뷰 목록 조회
router.get("/interview", authenticate, InterviewController.getInterviewsByUser);

// 인터뷰 피드백 수정
router.patch(
  "/interview/:id",
  authenticate,
  InterviewController.updateInterviewFeedback
);

// 인터뷰 삭제
router.delete(
  "/interview/:id",
  authenticate,
  InterviewController.deleteInterview
);

export default router;
