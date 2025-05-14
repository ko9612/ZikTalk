import express from "express";
import * as mypageController from "../controllers/mypage.controller.js";

const router = express.Router();

router.get("/bookmarks", mypageController.getMyBookmarks);

export default router;
