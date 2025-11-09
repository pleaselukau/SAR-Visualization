import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const __dirname = path.resolve();

function generateData() {
  const inputPath = path.join(__dirname, "data.xlsx");
  const outputPath = path.join(__dirname, "../client/public/data.json");

  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const columnMap = {
    "Molecule Name" : "name",
    "Molecular weight (g/mol)" : "weight",
    "log P" : "log_p",
    "log D" : "log_d",
    "pKa" : "pka",
    "Topological polar surface area (Å²)" : "tpsa",
    "Synonyms" : "synonyms",
    "Mean Dd2 Strain Growth Inhibition (72 h): pEC50" : "potency"
  };

  const selectedColumns = Object.keys(columnMap);

  const filteredData = sheet.map((row, index) => {
    const newRow = {};

    newRow.ID = index + 1;

    selectedColumns.forEach(col => {
      newRow[columnMap[col]] = row[col];
    });

    if (typeof newRow.potency === "string") {
      newRow.potency_string = newRow.potency;

      const match = newRow.potency.match(/[\d.]+/);
      newRow.potency = match ? parseFloat(match[0]) - 0.01 : null;

    }

    return newRow;
  });

  fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2));
  console.log("data.json generated successfully!");
}

generateData();
