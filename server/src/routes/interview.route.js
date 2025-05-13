// express router 정의
// api endpoint 정의 & 컨트롤러 함수와 연결
// 컨트롤러와 클라이언트 사이의 중간다리 역할

// 아래는 예시코드 (gpt)
import express from "express";
import {
  createInterviewQuestion,
  convertToText,
} from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/gpt-question", createInterviewQuestion);
router.post("/daglo", convertToText);

export default router;
