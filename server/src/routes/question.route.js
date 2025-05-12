import express from 'express';
import * as questionController from '../controllers/question.controller.js';

const router = express.Router();

// 모든 질문 조회
router.get('/', questionController.getAllQuestions);

// ID로 질문 조회
router.get('/:id', questionController.getQuestionById);

// 새 질문 생성
router.post('/', questionController.createQuestion);

// 질문 업데이트
router.put('/:id', questionController.updateQuestion);

// 질문 삭제
router.delete('/:id', questionController.deleteQuestion);

// 북마크 토글
router.patch('/:id/bookmark', questionController.toggleBookmark);

export default router; 