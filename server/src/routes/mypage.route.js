import express from "express";
import * as mypageController from "../controllers/mypage.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// 모든 mypage API에 인증 미들웨어 적용
router.use(authenticate);

router.get("/bookmarks", mypageController.getMyBookmarks);
router.get("/user", mypageController.getUserInfo);
router.post("/user/update", mypageController.updateUserInfo);

export default router;
