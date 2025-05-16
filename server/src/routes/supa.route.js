// routes/supaRouter.js
import fs from "fs";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const supaRouter = express.Router();
const upload = multer({ dest: "uploads/" }); // 임시 저장 경로

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🗃️ Supabase Storage 업로드 라우트
supaRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("============supaRouter==========");
    const file = req.file;
    const fileBuffer = fs.readFileSync(file.path);

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(file.originalname, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("❌ 업로드 실패:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "✅ 업로드 성공", path: data.path });
  } catch (err) {
    console.error("❌ 서버 오류:", err.message);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

export default supaRouter;
