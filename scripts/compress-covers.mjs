import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";
import ora from "ora";
import pc from "picocolors";
import boxen from "boxen";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const REPO_IMAGES_DIR = path.join(ROOT, "images");
const DATA_PATH = path.join(ROOT, "data", "photos-local.json");

const COVERS_DIR = path.join(PUBLIC_DIR, "images", "covers");
const HERO_DIR = path.join(PUBLIC_DIR, "images", "hero");
const LOGO_PNG = path.join(REPO_IMAGES_DIR, "logo.png");
const LOGO_WEBP = path.join(REPO_IMAGES_DIR, "logo.webp");

const COVER_MAX_DIMENSION = 1200;
const COVER_QUALITY = 80;

const HERO_MAX_DIMENSION = 2400;
const HERO_QUALITY = 85;

const LOGO_QUALITY = 90;

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

async function loadData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function collectCoverSources(data) {
  const sources = new Set();
  for (const loc of data.locations || []) if (loc.cover) sources.add(loc.cover);
  for (const cat of data.categories || []) if (cat.cover) sources.add(cat.cover);
  for (const photo of data.photos || []) if (photo.src) sources.add(photo.src);
  return [...sources].sort();
}

function collectHeroSources(data) {
  const sources = new Set();
  for (const photo of data.photos || []) {
    if (photo.src && (photo.hero || photo.mobileHero || photo.featured)) sources.add(photo.src);
  }
  return [...sources].sort();
}

async function isOutputFresh(sourcePath, outputPath) {
  if (FORCE) return false;
  const [src, out] = await Promise.all([fileMtime(sourcePath), fileMtime(outputPath)]);
  if (src == null || out == null) return false;
  return out >= src;
}

async function compressPhoto(relativeSrc, { outputDir, maxDimension, quality }) {
  const sourceAbs = path.join(PUBLIC_DIR, relativeSrc);
  const baseName = path.parse(relativeSrc).name;
  const webpOut = path.join(outputDir, `${baseName}.webp`);

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
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5 })
    .toFile(webpOut);

  const webpSize = await fileSize(webpOut);
  return { relativeSrc, status: "compressed", sourceSize, webpSize };
}

async function compressLogo() {
  const sourceSize = await fileSize(LOGO_PNG);
  if (!sourceSize) {
    return { relativeSrc: "images/logo.png", status: "missing", sourceSize: 0, webpSize: 0 };
  }

  if (await isOutputFresh(LOGO_PNG, LOGO_WEBP)) {
    const webpSize = await fileSize(LOGO_WEBP);
    return { relativeSrc: "images/logo.png", status: "skipped", sourceSize, webpSize };
  }

  await sharp(LOGO_PNG, { failOn: "none" })
    .webp({ quality: LOGO_QUALITY, effort: 6 })
    .toFile(LOGO_WEBP);

  const webpSize = await fileSize(LOGO_WEBP);
  return { relativeSrc: "images/logo.png", status: "compressed", sourceSize, webpSize };
}

function printBanner({ coverCount, heroCount }) {
  console.log(
    boxen(
      [
        `  ${pc.bold(pc.cyan("◆"))}  ${pc.bold("IMAGE COMPRESSOR")}`,
        `  ${pc.dim("─────────────────────────────────────────────")}`,
        `  ${pc.bold("Covers:")}   ${pc.cyan(String(coverCount))} @ ${COVER_MAX_DIMENSION}px q${COVER_QUALITY} ${pc.dim("→")} ${pc.dim(path.relative(ROOT, COVERS_DIR))}`,
        `  ${pc.bold("Hero:")}     ${pc.cyan(String(heroCount))} @ ${HERO_MAX_DIMENSION}px q${HERO_QUALITY} ${pc.dim("→")} ${pc.dim(path.relative(ROOT, HERO_DIR))}`,
        `  ${pc.bold("Logo:")}     ${pc.cyan("1")} ${pc.dim("(lossy WebP q" + LOGO_QUALITY + ")")} ${pc.dim("→")} ${pc.dim(path.relative(ROOT, LOGO_WEBP))}`,
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

function printSummary(label, results) {
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
      title: pc.green(pc.bold(`  ${label}  `)),
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

async function runPass(label, sources, config) {
  const results = [];
  for (let i = 0; i < sources.length; i += 1) {
    const relativeSrc = sources[i];
    const text = `${pc.bold(label)} [${i + 1}/${sources.length}] ${relativeSrc}`;
    const spinner = ora({ text, color: "cyan" }).start();
    try {
      const result = await compressPhoto(relativeSrc, config);
      if (result.status === "compressed") {
        const ratio = result.sourceSize > 0
          ? ` ${pc.dim("·")} ${pc.green(`-${((1 - result.webpSize / result.sourceSize) * 100).toFixed(0)}%`)}`
          : "";
        spinner.succeed(`${text} ${pc.dim(`(${formatBytes(result.sourceSize)} → ${formatBytes(result.webpSize)})`)}${ratio}`);
      } else if (result.status === "skipped") {
        spinner.info(`${text} ${pc.dim("(up-to-date)")}`);
      } else {
        spinner.fail(`${text} ${pc.red("(source missing)")}`);
      }
      results.push(result);
    } catch (error) {
      spinner.fail(`${text} ${pc.red(String(error?.message || error))}`);
      results.push({ relativeSrc, status: "missing", sourceSize: 0, webpSize: 0 });
    }
  }
  return results;
}

async function main() {
  const data = await loadData();
  const coverSources = collectCoverSources(data);
  const heroSources = collectHeroSources(data);

  await fs.mkdir(COVERS_DIR, { recursive: true });
  await fs.mkdir(HERO_DIR, { recursive: true });

  printBanner({ coverCount: coverSources.length, heroCount: heroSources.length });

  const coverResults = await runPass("covers", coverSources, {
    outputDir: COVERS_DIR,
    maxDimension: COVER_MAX_DIMENSION,
    quality: COVER_QUALITY,
  });
  printSummary("Covers Summary", coverResults);

  const heroResults = await runPass("hero  ", heroSources, {
    outputDir: HERO_DIR,
    maxDimension: HERO_MAX_DIMENSION,
    quality: HERO_QUALITY,
  });
  printSummary("Hero Summary", heroResults);

  const logoSpinner = ora({ text: `${pc.bold("logo  ")} images/logo.png`, color: "cyan" }).start();
  try {
    const logoResult = await compressLogo();
    if (logoResult.status === "compressed") {
      const ratio = logoResult.sourceSize > 0
        ? ` ${pc.dim("·")} ${pc.green(`-${((1 - logoResult.webpSize / logoResult.sourceSize) * 100).toFixed(0)}%`)}`
        : "";
      logoSpinner.succeed(`${pc.bold("logo  ")} images/logo.png ${pc.dim(`(${formatBytes(logoResult.sourceSize)} → ${formatBytes(logoResult.webpSize)})`)}${ratio}`);
    } else if (logoResult.status === "skipped") {
      logoSpinner.info(`${pc.bold("logo  ")} images/logo.png ${pc.dim("(up-to-date)")}`);
    } else {
      logoSpinner.fail(`${pc.bold("logo  ")} images/logo.png ${pc.red("(source missing)")}`);
    }
  } catch (error) {
    logoSpinner.fail(`${pc.bold("logo  ")} ${pc.red(String(error?.message || error))}`);
  }
}

main().catch((error) => {
  console.error(pc.red("✖ Failed to compress images."));
  console.error(error?.stack || error);
  process.exitCode = 1;
});
