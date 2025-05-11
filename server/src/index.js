// 기본 모듈 로드
import express from "express";
import dotenv from "dotenv";
import rootRouter from "./routes/root.route.js";
import cors from "cors";

// 환경 변수 설정
dotenv.config();
const app = express();

// json 파서 미들웨어
app.use(express.json());

// cors 설정
const corsOption = {
  origin: ["http://localhost:5173"], // 클라이언트 주소
};
app.use(cors(corsOption));

// 라우터 설정
app.use("/", rootRouter);

// 서버 포트 설정 및 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
