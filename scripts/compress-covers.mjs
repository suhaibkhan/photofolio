import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";
import ora from "ora";
import pc from "picocolors";
import boxen from "boxen";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_PATH = path.join(ROOT, "data", "photos-local.json");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "images", "covers");

const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 80;

const FORCE = process.argv.includes("--force");

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function fileMtime(absolutePath) {
  try {
    const stats = await fs.stat(absolutePath);
    return stats.mtimeMs;
  } catch {
    return null;
  }
}

async function fileSize(absolutePath) {
  try {
    const stats = await fs.stat(absolutePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function collectSources() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const data = JSON.parse(raw);

  const sources = new Set();
  for (const loc of data.locations || []) if (loc.cover) sources.add(loc.cover);
  for (const cat of data.categories || []) if (cat.cover) sources.add(cat.cover);
  for (const photo of data.photos || []) if (photo.src) sources.add(photo.src);

  return [...sources].sort();
}

async function isOutputFresh(sourcePath, outputPath) {
  if (FORCE) return false;
  const [src, out] = await Promise.all([fileMtime(sourcePath), fileMtime(outputPath)]);
  if (src == null || out == null) return false;
  return out >= src;
}

async function compressOne(relativeSrc) {
  const sourceAbs = path.join(PUBLIC_DIR, relativeSrc);
  const baseName = path.parse(relativeSrc).name;
  const webpOut = path.join(OUTPUT_DIR, `${baseName}.webp`);

  const sourceSize = await fileSize(sourceAbs);
  if (!sourceSize) {
    return { relativeSrc, status: "missing", sourceSize: 0, webpSize: 0 };
  }

  if (await isOutputFresh(sourceAbs, webpOut)) {
    const webpSize = await fileSize(webpOut);
    return { relativeSrc, status: "skipped", sourceSize, webpSize };
  }

  await sharp(sourceAbs, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(webpOut);

  const webpSize = await fileSize(webpOut);
  return { relativeSrc, status: "compressed", sourceSize, webpSize };
}

function printBanner(count) {
  console.log(
    boxen(
      [
        `  ${pc.bold(pc.cyan("◆"))}  ${pc.bold("COVER IMAGE COMPRESSOR")}`,
        `  ${pc.dim("─────────────────────────────────────────────")}`,
        `  ${pc.bold("Sources:")}  ${pc.cyan(String(count))} unique image${count === 1 ? "" : "s"}`,
        `  ${pc.bold("Max dim:")}  ${MAX_DIMENSION}px (long edge, no upscale)`,
        `  ${pc.bold("Output:")}   ${pc.dim(path.relative(ROOT, OUTPUT_DIR))} ${pc.dim("(.webp only — original .jpg is the fallback)")}`,
        `  ${pc.bold("Mode:")}     ${FORCE ? pc.yellow("force re-encode") : pc.dim("skip up-to-date outputs")}`,
      ].join("\n"),
      {
        borderStyle: "double",
        borderColor: "cyan",
        padding: { top: 1, bottom: 1, left: 1, right: 4 },
        margin: { top: 1, bottom: 1 },
      }
    )
  );
}

function printSummary(results) {
  const compressed = results.filter((r) => r.status === "compressed");
  const skipped = results.filter((r) => r.status === "skipped");
  const missing = results.filter((r) => r.status === "missing");

  const totalSource = results.reduce((sum, r) => sum + r.sourceSize, 0);
  const totalWebp = results.reduce((sum, r) => sum + r.webpSize, 0);

  const lines = [
    `  ${pc.green("✓")}  Compressed:  ${pc.bold(String(compressed.length))}`,
    `  ${pc.dim("○")}  Skipped:     ${pc.bold(String(skipped.length))} ${pc.dim("(already up-to-date)")}`,
  ];
  if (missing.length) {
    lines.push(`  ${pc.red("✖")}  Missing:     ${pc.bold(String(missing.length))} ${pc.dim("(source not found)")}`);
  }
  lines.push("");
  lines.push(`  ${pc.dim("Source total:")}  ${pc.bold(formatBytes(totalSource))}`);
  lines.push(`  ${pc.dim("WebP total:")}    ${pc.bold(formatBytes(totalWebp))}`);
  if (totalSource > 0) {
    const webpPct = ((1 - totalWebp / totalSource) * 100).toFixed(1);
    lines.push(`  ${pc.dim("Savings:")}       ${pc.green(`${webpPct}%`)}`);
  }

  console.log(
    boxen(lines.join("\n"), {
      title: pc.green(pc.bold("  Summary  ")),
      borderStyle: "round",
      borderColor: "green",
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      margin: { top: 1, bottom: 1 },
    })
  );

  if (missing.length) {
    console.log(pc.dim("  Missing sources:"));
    for (const r of missing) console.log(`    ${pc.red("·")} ${r.relativeSrc}`);
    console.log();
  }
}

async function main() {
  const sources = await collectSources();
  if (!sources.length) {
    console.log(pc.dim("No cover or photo sources found in data/photos-local.json — nothing to do."));
    return;
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  printBanner(sources.length);

  const results = [];
  for (let i = 0; i < sources.length; i += 1) {
    const relativeSrc = sources[i];
    const label = `[${i + 1}/${sources.length}] ${relativeSrc}`;
    const spinner = ora({ text: label, color: "cyan" }).start();
    try {
      const result = await compressOne(relativeSrc);
      if (result.status === "compressed") {
        const ratio = result.sourceSize > 0
          ? ` ${pc.dim("·")} ${pc.green(`-${((1 - result.webpSize / result.sourceSize) * 100).toFixed(0)}%`)}`
          : "";
        spinner.succeed(`${label} ${pc.dim(`(${formatBytes(result.sourceSize)} → ${formatBytes(result.webpSize)})`)}${ratio}`);
      } else if (result.status === "skipped") {
        spinner.info(`${label} ${pc.dim("(up-to-date)")}`);
      } else {
        spinner.fail(`${label} ${pc.red("(source missing)")}`);
      }
      results.push(result);
    } catch (error) {
      spinner.fail(`${label} ${pc.red(String(error?.message || error))}`);
      results.push({ relativeSrc, status: "missing", sourceSize: 0, webpSize: 0 });
    }
  }

  printSummary(results);
}

main().catch((error) => {
  console.error(pc.red("✖ Failed to compress covers."));
  console.error(error?.stack || error);
  process.exitCode = 1;
});
