// 📁 src/controllers/recordController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 대체 코드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const tempPath = req.file.path;
  const targetPath = path.join(
    __dirname,
    "../../uploads",
    req.file.originalname
  );

  fs.rename(tempPath, targetPath, (err) => {
    if (err) {
      console.error("파일 이동 실패:", err);
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  });
};
