// app.js
const express = require("express");
const path = require("path");
const traceRoute = require("./routes/traceRoute");

const app = express();

// 폼 데이터 받기
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// 메인 HTML 라우팅 (이력번호 입력 화면)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// API 라우트
app.use("/", traceRoute);

// Render 서버 포트
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
