const axios = require("axios");
const path = require("path");
const { formatDate, readFarmCodesFromExcel, getAverageGradeByFarm } = require("../utils/util");

exports.searchTrace = async (req, res) => {
    const traceNosInput = req.body.traceNos;
    const traceNos = traceNosInput
        .split(/\r?\n/)
        .map(t => t.replace(/\s+/g, "")) // 혹시 모를 공백 제거
        .filter(t => t);

    const validTraceNos = traceNos.filter(t => /^\d{12}$/.test(t));

    if (validTraceNos.length === 0) {
        return res.send("⚠️ 12자리 숫자가 아닌 이력번호가 포함되어 있습니다.");
    }

    const baseUrl = "http://data.ekape.or.kr/openapi-data/service/user/animalTrace/traceNoSearch";
    const serviceKey = "73d8164a411c22a772509a24eefe161f0ac31c9f1712b0d6dd0eb2d96d568444";

    const results = [];

    for (const traceNo of traceNos) {
        try {
            const response = await axios.get(baseUrl, {
                params: { traceNo, serviceKey }
            });

            results.push({
                traceNo,
                data: response.data.response?.body?.items?.item || [],
                error: null
            });
        } catch (error) {
            results.push({ traceNo, data: null, error: error.message });
        }
    }

    // infoType=2 는 도축출하만 남기기
    results.forEach(item => {
        if (!item.data) return;
        item.data = item.data.filter(i => {
            if (i.infoType === 2) {
                return i.regType === "도축출하";
            }
            return true;
        });
    });

    // 🔥 여기서부터: 업로드 파일 대신 public/farmData.xlsx 사용
    let farmCodes = {};
    let farmAvg = {};

    try {
        const excelPath = path.join(__dirname, "..", "public", "farmData.xlsx");
        farmCodes = readFarmCodesFromExcel(excelPath);       // { traceNo: { grade, farmId } }
        farmAvg = getAverageGradeByFarm(farmCodes);          // { farmId: { avgGrade, count, avgNumber } }

        // results 에 엑셀 데이터 매핑
        results.forEach(item => {
            const excelInfo = farmCodes[item.traceNo];        // { grade, farmId }
            item.excel = excelInfo || null;
        });
    } catch (e) {
        console.error("엑셀(farmData.xlsx) 읽기 오류:", e.message);
    }


    // 결과 HTML 생성
let html = `
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>조회 결과</title>
<style>
    /* ===============================
       Reset & Global
    =============================== */
    *,
    *::before,
    *::after {
        box-sizing: border-box;
        word-break: break-word;
    }

    body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
        margin: 0;
        padding: clamp(12px, 4vw, 32px);
        background: #f7f8fa; 
        color: #333;
    }

    a { 
        text-decoration: none; 
        color: #555; 
        margin-bottom: clamp(12px, 3vw, 20px); 
        display: inline-block; 
        font-weight: 600;
        font-size: clamp(14px, 2.5vw, 16px);
    }

    /* ===============================
       Title
    =============================== */
    h2 {
        color: #2a5d9f;
        margin-bottom: clamp(16px, 4vw, 28px);
        text-align: center;
        font-size: clamp(18px, 4vw, 26px);
    }

    /* ===============================
       Cards Wrapper
    =============================== */
    .trace-wrapper {
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(12px, 3vw, 20px);
        max-width: 1200px;
        margin: 0 auto;
    }

    /* ===============================
       Card
    =============================== */
    .trace-card { 
        background: #fff; 
        border-radius: 16px; 
        padding: clamp(14px, 3vw, 20px); 
        box-shadow: 0 6px 20px rgba(0,0,0,0.08); 
    }

    .trace-card h3 { 
        margin: 0 0 12px;
        font-size: clamp(15px, 3vw, 18px);
        color: #1f3d7a; 
        border-bottom: 1px solid #eee; 
        padding-bottom: 8px;
        text-align: center;
    }

    /* ===============================
       Item
    =============================== */
    .trace-item { 
        margin-top: clamp(8px, 2vw, 12px); 
        padding: clamp(10px, 2.5vw, 14px); 
        border-radius: 12px; 
        background: #f2f4f8; 
        font-size: clamp(13px, 2.8vw, 14px);
        line-height: 1.6;
    }

    .trace-item strong {
        display: block;
        margin-bottom: 4px;
        font-size: clamp(13px, 2.5vw, 14px);
        color: #333;
    }

    /* ===============================
       Info Type Colors
    =============================== */
    .trace-item.infoType1 { background: #e8f0fe; }
    .trace-item.infoType2 { background: #fff3e0; }
    .trace-item.infoType3 { background: #e0f7fa; }
    .trace-item.infoType4 { background: #f3e5f5; }
    .trace-item.infoType5 { background: #fff9c4; }
    .trace-item.infoType7 { background: #ffe0e0; }

    /* ===============================
       Tablet (iPad)
    =============================== */
    @media (min-width: 600px) {
        .trace-wrapper {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* ===============================
       Desktop
    =============================== */
    @media (min-width: 1024px) {
        .trace-wrapper {
            grid-template-columns: repeat(3, 1fr);
        }

        h2 {
            text-align: left;
        }
    }
</style>
</head>
<body>

<a href="/">← 다시 조회하기</a>
<h2>🐮 조회 결과</h2>
<div class="trace-wrapper">
`;


results.forEach(r => {
    html += `<div class="trace-card">`;
    html += `<h3>이력번호: ${r.traceNo}</h3>`;

    // ============================================================
    // 엑셀 정보 + 농장 평균 등급
    let excelInfo = farmCodes ? farmCodes[r.traceNo] : null;

    if (excelInfo && excelInfo.farmId) {
        const farmId = excelInfo.farmId;
        const avgInfo = farmAvg ? farmAvg[farmId] : null;

        if (avgInfo) {
            html += `
            <div class="trace-item" style="background:#e8f5e9;">
                <strong>농장식별번호</strong>${farmId}
                <strong>평균 등급</strong>${avgInfo.avgGrade}
                <span style="color:#888;">(${avgInfo.count}두 기준)</span>
            </div>
            `;
        } else {
            html += `
            <div class="trace-item" style="background:#fff3cd;">
                <strong>농장식별번호</strong>${farmId}
                평균 등급 데이터 없음
            </div>
            `;
        }
    } else {
        html += `
        <div class="trace-item" style="background:#fff3cd;">
            평균 등급 데이터 없음
        </div>
        `;
    }

    // ============================================================

    if (r.error) {
        html += `<p style="color:red;">오류: ${r.error}</p>`;
    } else {
        r.data.forEach(item => {
            let infoClass = `infoType${item.infoType}`;
            html += `<div class="trace-item ${infoClass}">`;

            switch (item.infoType) {
                case 1:
                    html += `
                        <strong>출생일</strong>${formatDate(item.birthYmd)}
                        <strong>소 번호</strong>${item.cattleNo}
                    `;
                    break;

                case 2:
                    html += `
                        <strong>농장주소</strong>${item.farmAddr}
                        <strong>농장주</strong>${item.farmerNm}
                        <strong>등록유형</strong>${item.regType}
                    `;
                    break;

                case 3:
                    html += `
                        <strong>도축장</strong>${item.butcheryPlaceNm}
                        <strong>주소</strong>${item.butcheryPlaceAddr}
                        <strong>도축일</strong>${formatDate(item.butcheryYmd)}
                        <strong>등급</strong>${item.gradeNm}
                    `;
                    break;

                case 4:
                    html += `
                        <strong>가공장</strong>${item.processPlaceNm}
                        <strong>주소</strong>${item.processPlaceAddr}
                    `;
                    break;

                case 5:
                    html += `
                        <strong>백신 정보</strong>${item.vaccineorder}
                        <strong>접종일</strong>${formatDate(item.injectionYmd)}
                    `;
                    break;

                case 7:
                    html += `
                        <strong>검사일</strong>${formatDate(item.inspectDt)}
                        <strong>결과</strong>${item.inspectYn}
                        <strong>TBC</strong>${item.tbcInspctRsltNm}
                    `;
                    break;

                default:
                    html += JSON.stringify(item);
            }

            html += `</div>`;
        });
    }

    html += `</div>`;
});

html += `
</body>
</html>
`;

res.send(html);
}