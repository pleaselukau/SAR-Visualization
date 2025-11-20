import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders
const svgFolder = path.join(__dirname, "svgs"); // your existing SVG files
const jsonFile = path.join(__dirname, "smiles.json"); // JSON file with molecular names

// Read JSON
const jsonData = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));

// Loop over each entry in JSON
jsonData.forEach((entry) => {
  const id = entry.ID; // Assuming JSON has {"ID":1,"name":"comp1"}
  const name = entry.name; // name of the compound

  const oldPath = path.join(svgFolder, `${id}.svg`);
  const newPath = path.join(svgFolder, `${name}.svg`);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldPath} → ${newPath}`);
  } else {
    console.log(`File not found: ${oldPath}`);
  }
});

console.log("Renaming complete.");
