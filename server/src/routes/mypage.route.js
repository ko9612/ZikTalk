import express from "express";
import * as mypageController from "../controllers/mypage.controller.js";

const router = express.Router();

router.get("/bookmarks", mypageController.getMyBookmarks);
router.get("/user", mypageController.getUserInfo);
router.post("/user/update", mypageController.updateUserInfo);

export default router;
