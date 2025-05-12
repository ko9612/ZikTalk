// express router 정의
// api endpoint 정의 & 컨트롤러 함수와 연결
// 컨트롤러와 클라이언트 사이의 중간다리 역할

// 아래는 예시코드 (gpt)
import express from "express";
import * as interviewController from "../controllers/interview.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// 모든 면접 조회
router.get("/", interviewController.getAllInterviews);

// ID로 면접 조회
router.get("/:id", interviewController.getInterviewById);

// 사용자 ID로 면접 조회
router.get("/user/:userId", interviewController.getInterviewsByUserId);

// 새 면접 생성
router.post("/", interviewController.createInterview);

// 면접 업데이트
router.put("/:id", interviewController.updateInterview);

// 면접 삭제
router.delete("/:id", interviewController.deleteInterview);

// 북마크 토글
router.patch("/:id/bookmark", interviewController.toggleBookmark);

export default router;
