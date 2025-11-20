import { chromium } from "playwright";
import { test } from "@playwright/test";
import fs from "fs";

// const data = JSON.parse(fs.readFileSync("smiles.json", "utf8"));
// // const smilesList = data.slice(0, 10).map((item) => item.smiles);
// const smilesText = data.join("\n");

const data = JSON.parse(fs.readFileSync("smiles.json", "utf8"));
const smilesList = data.map((item) => item.smiles);
const smilesText = smilesList.join("\n");

test("Extract SVGs", async () => {
  // test.setTimeout(0);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    "https://www.cheminfo.org/Chemistry/Cheminformatics/SMILES_to_svg/index.html",
    { waitUntil: "domcontentloaded" }
  );

  const textarea = await page.waitForSelector(
    '//*[text()="List of SMILES"]/../..//textarea'
  );

  await textarea.fill(smilesText);

  await page.getByRole("button", { name: "Execute" }).click();

  await page.waitForTimeout(5000);

  const span = await page.waitForSelector(
    '//span[text()="SVG" and contains(@class, "slick-column-name")]'
  );
  await span.click({ button: "right" });

  await page.waitForTimeout(1000);

  await page.click('//a[normalize-space(text())="Export"]');

  await page.waitForTimeout(1000);

  const exportTextarea = await page.waitForSelector(
    '//span[text()="Export data from module "]/../..//textarea'
  );

  const outputText = await exportTextarea.inputValue();

  fs.writeFileSync("harsh.txt", outputText, "utf8");

  console.log("✅ Extracted output saved to harsh.txt");

  await browser.close();
});
