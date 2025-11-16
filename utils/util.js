
const XLSX = require("xlsx");

function formatDate(yyyymmdd) {
    if (!yyyymmdd) return '';
    const str = yyyymmdd.toString().trim();
    if (str.length !== 8) return str;

    return `${str.slice(0,4)}/${str.slice(4,6)}/${str.slice(6,8)}`;
}

function readFarmCodesFromExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const result = {};

    rows.forEach(row => {
        const traceNo = String(row["이력번호"]).replace(/\s+/g, "")
        result[traceNo] = {
            grade: row["육질등급"] || "",
            farmId: row["최종 농장식별번호"] || ""
        };
    });
    return result;
};

function getAverageGradeByFarm(farmCodes) {
    const groups = {};   // { farmId: [숫자등급, 숫자등급...] }

    // 1) 농장별 배열 그룹 만들기
    Object.values(farmCodes).forEach(item => {
        const farmId = item.farmId?.trim();
        if (!farmId) return;

        const numGrade = gradeToNumber(item.grade);
        if (numGrade === null) return;

        if (!groups[farmId]) groups[farmId] = [];
        groups[farmId].push(numGrade);
    });

    // 2) 평균 계산
    const result = {};
    for (const farmId in groups) {
        const arr = groups[farmId];

        const sum = arr.reduce((a, b) => a + b, 0);
        const avg = sum / arr.length;

        result[farmId] = {
            count: arr.length,
            avgNumber: avg,
            avgGrade: numberToGrade(avg)
        };
    }

    return result;
}
function gradeToNumber(grade) {
    if (!grade) return null;

    grade = grade.replace("등급", "").trim();  // "1++등급" → "1++"

    switch (grade) {
        case "1++": return 1;
        case "1+":  return 2;
        case "1":   return 3;
        case "2":   return 4;
        case "3":   return 5;
        default:    return null;
    }
}

function numberToGrade(num) {
    const rounded = Math.round(num);

    switch (rounded) {
        case 1: return "1++";
        case 2: return "1+";
        case 3: return "1";
        case 4: return "2";
        case 5: return "3";
        default: return "-";
    }
}


module.exports = { formatDate, readFarmCodesFromExcel, gradeToNumber, getAverageGradeByFarm, numberToGrade };

