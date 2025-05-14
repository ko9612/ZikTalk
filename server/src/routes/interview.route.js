// express router 정의
// api endpoint 정의 & 컨트롤러 함수와 연결
// 컨트롤러와 클라이언트 사이의 중간다리 역할

// 아래는 예시코드 (gpt)
import express from "express";
import * as interviewController from "../controllers/interview.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createInterviewQuestion,
  convertToText,
} from "../controllers/interview.controller.js";

const router = express.Router();

// 순서 중요: 특정 경로를 와일드카드 패턴보다 먼저 정의

// 모든 면접 조회
router.get("/", interviewController.getAllInterviews);

// 면접 첫번째 질문만 포함하여 조회
router.get("/with-first-question", interviewController.getAllInterviewsWithFirstQuestion);

// 여러 면접 한 번에 삭제 (배치 삭제)
router.post("/batch-delete", interviewController.batchDeleteInterviews);

// 사용자 ID로 면접 조회
router.get("/user/:userId", interviewController.getInterviewsByUserId);

// API 엔드포인트들
router.post("/gpt-question", createInterviewQuestion);
router.post("/daglo", convertToText);

// 새 면접 생성
router.post("/", interviewController.createInterview);

// 와일드카드 패턴을 가진 라우트들은 마지막에 배치
// ID로 면접 조회 (와일드카드 패턴)
router.get("/:id", interviewController.getInterviewById);

// 면접 업데이트
router.put("/:id", interviewController.updateInterview);

// 면접 삭제
router.delete("/:id", interviewController.deleteInterview);

// 북마크 토글
router.patch("/:id/bookmark", interviewController.toggleBookmark);

export default router;
