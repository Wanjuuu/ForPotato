// app.js
const express = require("express");
const path = require("path");
const traceRoute = require("./routes/traceRoute");

const app = express();
const PORT = 3000;

// POST 폼 데이터 받기
app.use(express.urlencoded({ extended: true }));

// 정적 파일 경로 설정 (views 폴더 내 HTML 사용)
app.use(express.static(path.join(__dirname, "views")));

// 라우트 등록
app.use("/", traceRoute);

// 서버 실행
app.listen(PORT, () => {
const PORT = 3000;
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});