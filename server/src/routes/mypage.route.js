import express from 'express';
import * as mypageController from '../controllers/mypage.controller.js';

const router = express.Router();

// 북마크 목록 조회
router.get('/bookmarks', mypageController.getMyBookmarks);

export default router; 