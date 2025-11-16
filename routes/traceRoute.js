// routes/traceRoute.js
const express = require("express");
const path = require("path");
const router = express.Router();
const traceController = require("../controllers/traceController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// ❌ 이거 지움: router.get("/") - 이제 static이 / 처리함
// router.get("/", (req, res) => {
//   res.sendFile("index.html", { root: "views" });
// });

// ✅ 조회 요청 (POST /search)만 담당
router.post("/search", upload.single("excelFile"), traceController.searchTrace);

module.exports = router;
