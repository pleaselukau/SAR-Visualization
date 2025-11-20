import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// To get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your input file
const inputFile = path.join(__dirname, "harsh.txt");

// Folder to save SVGs
const outputFolder = path.join(__dirname, "svgs");

// Create folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Read the file
const data = fs.readFileSync(inputFile, "utf-8");

// Match all SVG blocks
const svgMatches = data.match(/<svg[\s\S]*?<\/svg>/g);

if (!svgMatches) {
  console.log("No SVGs found in the file.");
  process.exit();
}

// Save each SVG into a separate file
svgMatches.forEach((svgContent, index) => {
  const filePath = path.join(outputFolder, `${index + 1}.svg`);
  fs.writeFileSync(filePath, svgContent, "utf-8");
  console.log(`Saved ${filePath}`);
});

console.log(`Total SVGs saved: ${svgMatches.length}`);
