// routes/traceRoute.js
const express = require("express");
const router = express.Router();
const traceController = require("../controllers/traceController");

const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 기본 페이지 (입력화면)
router.get("/", (req, res) => {
  res.sendFile("index.html", { root: "views" });
});

// 조회 요청 (POST)
router.post("/search", upload.single('excelFile'), traceController.searchTrace);

module.exports = router;