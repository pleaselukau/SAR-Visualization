import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const __dirname = path.resolve();

console.log(__dirname);

function generateData() {
  const inputPath = path.join(__dirname, "data.xlsx");
  const outputPath = path.join(__dirname, "../client/public/data.json");

  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  fs.writeFileSync(outputPath, JSON.stringify(sheet, null, 2));
  console.log("data.json generated successfully!");
}

generateData();
