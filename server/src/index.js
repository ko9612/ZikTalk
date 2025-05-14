import express from "express";
import dotenv from "dotenv";
import rootRouter from "./routes/root.route.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());

const corsOption = {
  origin: ["http://localhost:5173"],
};
app.use(cors(corsOption));

app.use("/api", rootRouter); // /api/mypage/...

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
