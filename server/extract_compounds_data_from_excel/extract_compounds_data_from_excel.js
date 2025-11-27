import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const __dirname = path.resolve();

function generateData() {
  // Set input and output file paths
  const inputPath = path.join(
    __dirname,
    "extract_compounds_data_from_excel/compounds.xlsx"
  );
  const outputPath = path.join(
    __dirname,
    "extract_compounds_data_from_excel/data.json"
  );

  // Load Excel file
  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Map Excel columns to JSON fields
  const columnMap = {
    name: "name",
    MW: "weight",
    "log P": "log_p",
    "log D": "log_d",
    pKa: "pka",
    TPSA: "tpsa",
    Synonyms: "synonyms",
    pec50: "potency",
    "SMILES For SVG Generation": "smiles",
  };

  const selectedColumns = Object.keys(columnMap);

  // Transform each row of Excel into JSON format
  const filteredData = sheet.map((row, index) => {
    const newRow = {};

    // Assign row ID
    newRow.ID = index + 1;

    // Copy selected columns into the output structure
    selectedColumns.forEach((col) => {
      newRow[columnMap[col]] = row[col];
    });

    // Clean potency values
    if (typeof newRow.potency === "string") {
      const raw = newRow.potency.trim();
      newRow.potency_string = raw;

      if (raw.startsWith("<")) {
        newRow.potency = 5.0;
      } else {
        const match = raw.match(/[\d.]+/);
        newRow.potency = match ? parseFloat(match[0]) : null;
      }
    }

    return newRow;
  });

  // Save JSON output
  fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2));
  console.log("data.json generated successfully!");
}

generateData();
