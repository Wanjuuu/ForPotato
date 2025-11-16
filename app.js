// app.js
const express = require("express");
const path = require("path");
const traceRoute = require("./routes/traceRoute");

const app = express();

// 폼 데이터 파싱
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 정적 파일(css, js) 제공 - public 폴더
app.use(express.static(path.join(__dirname, "public")));

// 라우트 등록 (GET /, POST /search 등은 여기로)
app.use("/", traceRoute);

// Render에서 주는 PORT 사용
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
