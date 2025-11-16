// app.js
const express = require("express");
const path = require("path");
const traceRoute = require("./routes/traceRoute");

const app = express();

// 바디 파서
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 public 폴더 정적 파일 제공 (index.html, style.css 모두 여기)
app.use(express.static(path.join(__dirname, "public")));

// 🔥 라우트 (POST /search 등)
app.use("/", traceRoute);

// Render 포트 사용
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
