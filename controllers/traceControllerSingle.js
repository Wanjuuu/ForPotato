// controllers/traceController.js
const axios = require("axios");
const baseUrl = "http://data.ekape.or.kr/openapi-data/service/user/animalTrace/traceNoSearch";
const serviceKey = "73d8164a411c22a772509a24eefe161f0ac31c9f1712b0d6dd0eb2d96d568444";

exports.searchTrace = async (req, res) => {
  const traceNo = req.body.traceNo;
  try {
    const response = await axios.get(baseUrl, {
      params: { traceNo, serviceKey },
    });

    res.send(`
      <html>
        <head><title>이력번호 조회 결과</title></head>
        <body style="font-family:sans-serif; padding:20px;">
          <h2>🐮 조회 결과</h2>
          <p><b>Trace No:</b> ${traceNo}</p>
          <pre>${response.data}</pre>
          <a href="/">← 다시 조회하기</a>
        </body>
      </html>
    `);
  } catch (error) {
    console(error)
    res.send(`
      <html>
        <head><title>오류</title></head>
        <body style="font-family:sans-serif; padding:20px;">
          <h2>⚠️ 오류 발생</h2>
          <p>${error.message}</p>
          <a href="/">← 다시 시도</a>
        </body>
      </html>
    `);
  }
};