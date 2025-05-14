// 📁 src/routes/record.route.js
import express from "express";
import multer from "multer";
import { handleUpload } from "../controllers/recordController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), handleUpload);

export default router;
