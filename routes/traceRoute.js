// routes/traceRoute.js
const express = require("express");
const path = require("path");
const router = express.Router();
const traceController = require("../controllers/traceController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// ✅ 메인 페이지 (이력번호 입력 화면)
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

// ✅ 조회 요청 (POST /search)
router.post("/search", upload.single("excelFile"), traceController.searchTrace);

module.exports = router;
