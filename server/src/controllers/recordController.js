// 📁 src/controllers/recordController.js
// import fs from "fs";
import path from "path";
import supabase from "../utils/supabaseClient.js";
import { fileURLToPath } from "url";

// __dirname 대체 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    // 파일 이름 (예: interview_1.webm)
    const filename = file.originalname;
    const filepath = `${filename}`; // 저장 디렉토리

    // Supabase Storage 업로드
    const { data, error } = await supabase.storage
      .from("ziktalk") // 버킷 이름
      .upload(filepath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // 이미 존재하면 덮어쓰기
      });

    if (error) {
      console.error("❌ Supabase 업로드 실패:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // public URL 반환 (선택)
    const { data: urlData } = supabase.storage
      .from("ziktalk")
      .getPublicUrl(filepath);

    return res.status(200).json({
      message: "✅ 업로드 성공",
      path: data.path,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    return res.status(500).json({ error: "업로드 처리 중 오류 발생" });
  }
};
