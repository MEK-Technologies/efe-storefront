// scripts/redirects/generate-bloom-filter.ts
import bloomFilters from "bloom-filters";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
var { ScalableBloomFilter } = bloomFilters;
async function generateBloomFilter(options) {
  const { inputPath: inputPath2, outputPath: outputPath2, errorRate: errorRate2 } = options;
  console.log("\u{1F527} Generating Bloom Filter for redirects...");
  console.log(`\u{1F4C2} Input: ${inputPath2}`);
  console.log(`\u{1F4C2} Output: ${outputPath2}`);
  console.log(`\u{1F3AF} Target error rate: ${(errorRate2 * 100).toFixed(2)}%`);
  const inputFullPath = join(process.cwd(), inputPath2);
  if (!existsSync(inputFullPath)) {
    console.error(`\u274C Input file not found: ${inputFullPath}`);
    console.error("   Run 'yarn redirects:generate-test' to create test data first");
    process.exit(1);
  }
  console.log("\n\u{1F4E5} Loading redirects...");
  const startTime = Date.now();
  let redirects;
  try {
    const content = readFileSync(inputFullPath, "utf-8");
    redirects = JSON.parse(content);
  } catch (error) {
    console.error("\u274C Failed to parse redirects JSON:", error);
    process.exit(1);
  }
  const keys = Object.keys(redirects);
  console.log(`   \u2705 Loaded ${keys.length} redirect entries`);
  console.log("\n\u{1F528} Creating Scalable Bloom Filter...");
  const filter = new ScalableBloomFilter(keys.length, errorRate2);
  const addStartTime = Date.now();
  let added = 0;
  const reportInterval = Math.floor(keys.length / 10) || 1;
  for (const key of keys) {
    if (key === "/") {
      filter.add("/home");
    } else {
      filter.add(key);
    }
    added++;
    if (added % reportInterval === 0) {
      const progress = Math.floor(added / keys.length * 100);
      console.log(`   \u{1F4CA} Progress: ${progress}% (${added}/${keys.length})`);
    }
  }
  const addDuration = ((Date.now() - addStartTime) / 1e3).toFixed(2);
  console.log(`   \u2705 Added all paths in ${addDuration}s`);
  console.log("\n\u{1F4BE} Saving Bloom Filter...");
  const filterJson = filter.saveAsJSON();
  const outputFullPath = join(process.cwd(), outputPath2);
  writeFileSync(outputFullPath, JSON.stringify(filterJson));
  const totalDuration = ((Date.now() - startTime) / 1e3).toFixed(2);
  const filterSize = JSON.stringify(filterJson).length;
  const originalSize = JSON.stringify(redirects).length;
  const compression = ((1 - filterSize / originalSize) * 100).toFixed(1);
  console.log(`
\u2705 Bloom Filter generated successfully in ${totalDuration}s`);
  console.log(`\u{1F4C1} Output: ${outputFullPath}`);
  console.log(`
\u{1F4CA} Statistics:`);
  console.log(`   - Filter size: ${(filterSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Space savings: ${compression}%`);
  console.log(`   - Error rate: ${(errorRate2 * 100).toFixed(4)}%`);
  console.log(`   - Expected false positives: ~${Math.floor(keys.length * errorRate2)} paths`);
  console.log(`
\u{1F9EA} Testing filter with sample paths:`);
  const samples = keys.slice(0, 3);
  samples.forEach((path) => {
    const testPath = path === "/" ? "/home" : path;
    const inFilter = filter.has(testPath);
    console.log(`   ${path} \u2192 ${inFilter ? "\u2705 Found" : "\u274C Not found"} ${path === "/" ? "(tested as /home)" : ""}`);
  });
  const fakePaths = ["/fake/path/1", "/non/existent/2", "/test/missing/3"];
  console.log(`
\u{1F9EA} Testing with non-existent paths:`);
  let falsePositives = 0;
  fakePaths.forEach((path) => {
    const inFilter = filter.has(path);
    if (inFilter) falsePositives++;
    console.log(`   ${path} \u2192 ${inFilter ? "\u26A0\uFE0F  False positive" : "\u2705 Correctly not found"}`);
  });
  if (falsePositives > 0) {
    console.log(`
\u26A0\uFE0F  Found ${falsePositives} false positive(s) in ${fakePaths.length} tests`);
    console.log("   This is expected behavior for Bloom Filters.");
  }
}
var args = process.argv.slice(2);
var _a;
var inputPath = ((_a = args.find((arg) => arg.startsWith("--input="))) == null ? void 0 : _a.split("=")[1]) || "lib/redirects/new-redirects.json";
var _a2;
var outputPath = ((_a2 = args.find((arg) => arg.startsWith("--output="))) == null ? void 0 : _a2.split("=")[1]) || "lib/redirects/bloom-filter.json";
var _a3;
var errorRate = parseFloat(((_a3 = args.find((arg) => arg.startsWith("--error-rate="))) == null ? void 0 : _a3.split("=")[1]) || "0.0001");
if (args.includes("--help")) {
  console.log(`
Generate Bloom Filter Script

Usage: yarn redirects:generate-bloom [options]

Options:
  --input=<path>       Input redirects JSON file (default: lib/redirects/new-redirects.json)
  --output=<path>      Output Bloom Filter JSON file (default: lib/redirects/bloom-filter.json)
  --error-rate=<rate>  False positive error rate (default: 0.0001 = 0.01%)
  --help               Show this help message

Examples:
  yarn redirects:generate-bloom
  yarn redirects:generate-bloom --input=data/redirects.json
  yarn redirects:generate-bloom --error-rate=0.001
  yarn redirects:generate-bloom --input=lib/redirects/test-redirects.json --output=lib/redirects/test-bloom.json

Notes:
  - Lower error rates require more memory but reduce false positives
  - The Bloom Filter will handle the "/" \u2192 "/home" transformation automatically
  - Typical error rates: 0.0001 (0.01%), 0.001 (0.1%), 0.01 (1%)
`);
  process.exit(0);
}
if (errorRate <= 0 || errorRate >= 1) {
  console.error("\u274C Error rate must be between 0 and 1 (exclusive)");
  process.exit(1);
}
generateBloomFilter({
  inputPath,
  outputPath,
  errorRate
});
