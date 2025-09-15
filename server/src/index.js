import express from "express";
import dotenv from "dotenv";
import rootRouter from "./routes/root.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./utils/prisma.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// 모든 요청을 로깅하는 미들웨어
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("요청 헤더:", req.headers);
  if (req.method !== "GET") {
    console.log("요청 바디:", req.body);
  }
  next();
});

// ping test용
app.head("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).end();
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).end();
  }
});

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "https://zik-talk-smey.vercel.app",
    "https://zik-talk-smey-git-feat-sohyun-token-ko9612s-projects.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api", rootRouter); // /api/mypage/...

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
