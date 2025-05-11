const express = require("express");
const router = express.Router();

// get 요청이 "/" 경로로 들어올 때 호출되는 핸들러
router.get("/api", (req, res) => {
  res.json({ message: "✅ API is working!" });
});

module.exports = router;
