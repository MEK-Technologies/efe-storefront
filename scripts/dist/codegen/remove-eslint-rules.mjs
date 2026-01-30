// scripts/codegen/remove-eslint-rules.ts
import { promises as fs } from "fs";
import * as path from "path";
async function findFiles(dir, fileNames) {
  const foundFiles = [];
  const skipDirs = /* @__PURE__ */ new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);
  async function searchDirectory(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory() && !skipDirs.has(entry.name)) {
          await searchDirectory(fullPath);
        } else if (entry.isFile() && fileNames.includes(entry.name)) {
          foundFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${currentDir}`);
    }
  }
  await searchDirectory(dir);
  return foundFiles;
}
async function cleanupEslintLines(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const linesToRemove = /* @__PURE__ */ new Set([
      "/* eslint-disable eslint-comments/disable-enable-pair */",
      "/* eslint-disable eslint-comments/no-unlimited-disable */"
    ]);
    const lines = content.split("\n");
    const filteredLines = lines.filter((line) => !linesToRemove.has(line.trim()));
    const hasChanges = lines.length !== filteredLines.length;
    if (hasChanges) {
      const cleanedContent = filteredLines.join("\n");
      await fs.writeFile(filePath, cleanedContent, "utf8");
      console.log(`\u2705 Cleaned up ${filePath}`);
      return true;
    }
    console.log(`\u2139\uFE0F  No changes needed for ${filePath}`);
    return false;
  } catch (error) {
    console.error(`\u274C Error processing ${filePath}:`, error);
    return false;
  }
}
async function main() {
  console.log("\u{1F9F9} Cleaning up ESLint disable lines from generated files...\n");
  const targetFiles = ["admin.generated.d.ts", "storefront.generated.d.ts"];
  const searchRoot = process.cwd();
  console.log(`Searching for files in: ${searchRoot}
`);
  try {
    const foundFiles = await findFiles(searchRoot, targetFiles);
    if (foundFiles.length === 0) {
      console.log("\u26A0\uFE0F  No target files found. Looking for:");
      for (const file of targetFiles) {
        console.log(`   - ${file}`);
      }
      process.exit(0);
    }
    console.log(`Found ${foundFiles.length} file(s):`);
    for (const file of foundFiles) {
      console.log(`   - ${file}`);
    }
    console.log();
    const cleanupPromises = foundFiles.map((filePath) => cleanupEslintLines(filePath));
    const results = await Promise.allSettled(cleanupPromises);
    const totalCleaned = results.reduce((count, result) => {
      return count + (result.status === "fulfilled" && result.value ? 1 : 0);
    }, 0);
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length > 0) {
      console.log(`
\u26A0\uFE0F  ${failures.length} file(s) failed to process`);
    }
    console.log(`
\u{1F389} Done! Processed ${foundFiles.length} file(s), cleaned ${totalCleaned} file(s).`);
  } catch (error) {
    console.error("\u274C Fatal error:", error);
    process.exit(1);
  }
}
main();
