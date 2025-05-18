// 📁 src/routes/record.route.js
import express from "express";
import multer from "multer";
import { handleUpload } from "../controllers/recordController.js";

const router = express.Router();

// Multer 메모리 저장소 (buffer 형태로 받기)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), handleUpload);

export default router;
