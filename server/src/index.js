const express = require("express");
const dotenv = require("dotenv");
const rootRouter = require("./routes/root.route");

dotenv.config();
const app = express();

app.use(express.json());

// 라우터
app.use("/", rootRouter);

// 포트 설정
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
