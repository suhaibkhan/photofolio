import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

import enquirer from "enquirer";
import boxen from "boxen";
import exifr from "exifr";
import { imageSize } from "image-size";
import ora from "ora";
import pc from "picocolors";
import { ToolLoopAgent } from "ai";
import { createVertex } from "@ai-sdk/google-vertex";
import dotenvFlow from "dotenv-flow";

const ROOT = process.cwd();
const ENV_MODE = process.env.NODE_ENV || "development";
dotenvFlow.config({ path: ROOT, node_env: ENV_MODE });

const PHOTOS_DIR     = path.join(ROOT, "public", "images", "photos");
const LIGHTROOM_DIR  = "/Users/suhaibkhan/Pictures/Lightroom Catalogs/Lightroom Exports/Web";
const DATA_PATH = path.join(ROOT, "data", "photos-local.json");
const AI_MODEL_ID = process.env.LOCAL_PHOTO_AI_MODEL || "gemini-3-flash-preview";
const vertex = createVertex({ apiKey: process.env.GOOGLE_VERTEX_API_KEY });

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic"]);

const photoCopyAgent = new ToolLoopAgent({
  model: vertex(AI_MODEL_ID),
  instructions: [
    "You are a photography copywriter for travel, nature, and landscape images.",
    "Generate evocative but concise copy from the photo and user notes.",
    "Return ONLY valid JSON with this exact shape:",
    '{"title":"...","description":"..."}',
    "Title rules: 2 to 7 words, no hashtags, no emojis.",
    "Description rules: 1 to 2 sentences, under 220 characters, vivid and grounded.",
  ].join("\n"),
});

// ─── Text helpers ─────────────────────────────────────────────────────────────

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSlug(base, existingIds) {
  const start = slugify(base) || "item";
  if (!existingIds.has(start)) return start;
  let index = 2;
  let candidate = `${start}-${index}`;
  while (existingIds.has(candidate)) { index += 1; candidate = `${start}-${index}`; }
  return candidate;
}

function wrapText(value, lineWidth = 72) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value
    .split(/\r?\n/)
    .map((line) => {
      const words = line.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return "";
      const wrapped = [];
      let current = "";
      words.forEach((word) => {
        if (!current) { current = word; return; }
        if (`${current} ${word}`.length <= lineWidth) { current = `${current} ${word}`; return; }
        wrapped.push(current);
        current = word;
      });
      if (current) wrapped.push(current);
      return wrapped.join("\n");
    })
    .join("\n")
    .trim();
}

// ─── EXIF / metadata helpers ──────────────────────────────────────────────────

function formatFraction(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  if (value >= 1) return `${value.toFixed(2).replace(/\.00$/, "")}s`;
  const denominator = Math.round(1 / value);
  if (!Number.isFinite(denominator) || denominator <= 0) return `${value.toFixed(4)}s`;
  return `1/${denominator}s`;
}

function normalizeFNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return `f/${value.toFixed(1).replace(/\.0$/, "")}`;
}

function normalizeFocalLength(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return `${value.toFixed(0)}mm`;
}

function normalizeCamera(make, model) {
  const parts = [make, model]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 2 && parts[1].toLowerCase().startsWith(parts[0].toLowerCase())) return parts[1];
  return parts.join(" ");
}

async function extractMetadata(absolutePath) {
  const [size, exif] = await Promise.all([
    Promise.resolve(imageSize(absolutePath)),
    exifr.parse(absolutePath).catch(() => null),
  ]);
  return {
    width: size.width,
    height: size.height,
    metadata: {
      camera: normalizeCamera(exif?.Make, exif?.Model),
      iso: typeof exif?.ISO === "number" && Number.isFinite(exif.ISO) ? Math.round(exif.ISO) : null,
      aperture: normalizeFNumber(exif?.FNumber),
      shutterSpeed: formatFraction(exif?.ExposureTime),
      focalLength: normalizeFocalLength(exif?.FocalLength),
    },
  };
}

// ─── AI helpers ───────────────────────────────────────────────────────────────

function extractJsonObject(rawText) {
  if (typeof rawText !== "string" || !rawText.trim()) return null;
  const trimmed = rawText.trim();
  const direct = trimmed.startsWith("{") && trimmed.endsWith("}") ? trimmed : null;
  const candidate = direct || trimmed.match(/\{[\s\S]*\}/)?.[0] || null;
  if (!candidate) return null;
  try { return JSON.parse(candidate); } catch { return null; }
}

function normalizeAiString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

async function generateAICopy({ absolutePath, fileName, userWords, location, categories, metadata, revisionNotes }) {
  const imageBuffer = await fs.readFile(absolutePath);

  const metaContext = [
    metadata?.camera       ? `Camera: ${metadata.camera}`          : null,
    metadata?.focalLength  ? `Focal length: ${metadata.focalLength}` : null,
    metadata?.aperture     ? `Aperture: ${metadata.aperture}`       : null,
    metadata?.shutterSpeed ? `Shutter: ${metadata.shutterSpeed}`    : null,
    metadata?.iso != null  ? `ISO: ${metadata.iso}`                 : null,
  ].filter(Boolean).join(", ");

  const prompt = [
    "Create a title and description for this photo.",
    `Filename: ${fileName}`,
    `Location: ${location || "Unknown"}`,
    `Categories: ${categories.length ? categories.join(", ") : "Unspecified"}`,
    metaContext ? `Camera settings: ${metaContext}` : null,
    `Photographer notes: ${userWords || "No extra notes provided"}`,
    revisionNotes ? `Revision request: ${revisionNotes}` : null,
  ].filter(Boolean).join("\n");

  const result = await photoCopyAgent.generate({
    messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image", image: imageBuffer }] }],
  });

  const parsed = extractJsonObject(result.text);
  if (!parsed || typeof parsed !== "object") throw new Error("AI response did not contain valid JSON.");

  const title = normalizeAiString(parsed.title, 120);
  const description = normalizeAiString(parsed.description, 260);
  if (!title || !description) throw new Error("AI response is missing title or description.");

  return { title, description };
}

// ─── Visual panels ────────────────────────────────────────────────────────────

function renderProgressBar(current, total, width = 26) {
  if (total <= 0) return "";
  const filled = Math.min(Math.round((current / total) * width), width);
  return `${pc.cyan("█".repeat(filled))}${pc.dim("░".repeat(width - filled))}`;
}

function renderPhotoPanel(fileName, src, index, total) {
  const bar = renderProgressBar(index + 1, total);
  const pct = Math.round(((index + 1) / total) * 100);
  return boxen(
    [
      `  ${pc.bold("File:")}     ${pc.yellow(fileName)}`,
      `  ${pc.bold("Source:")}   ${pc.dim(src)}`,
      `  ${pc.bold("Progress:")} ${bar} ${pc.bold(String(index + 1))}${pc.dim(`/${total}`)} ${pc.dim(`(${pct}%)`)}`,
    ].join("\n"),
    {
      title: pc.bold(pc.cyan(`  Photo ${index + 1} of ${total}  `)),
      titleAlignment: "center",
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "round",
      borderColor: "cyan",
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
    }
  );
}

function renderMetadataPanel(meta, width, height) {
  const dash = pc.dim("—");
  const rows = [
    ["Dimensions",   `${width} × ${height} px`],
    ["Camera",       meta.camera       || dash],
    ["Aperture",     meta.aperture     || dash],
    ["Shutter",      meta.shutterSpeed || dash],
    ["Focal length", meta.focalLength  || dash],
    ["ISO",          meta.iso != null ? String(meta.iso) : dash],
  ];
  return boxen(
    rows.map(([label, val]) => `  ${pc.dim(label.padEnd(14))}${val}`).join("\n"),
    {
      title: pc.dim("  EXIF  "),
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "round",
      borderColor: "gray",
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
    }
  );
}

function renderAIPanel(title, description, isRevision = false) {
  const label = isRevision ? pc.yellow("  ↺ Revised Suggestion  ") : pc.green("  ✦ AI Suggestion  ");
  const descLines = wrapText(description, 60).split("\n").join("\n  ");
  return boxen(
    [
      `  ${pc.bold("Title:")}`,
      `  ${pc.green(pc.bold(title))}`,
      "",
      `  ${pc.bold("Description:")}`,
      `  ${pc.italic(descLines)}`,
    ].join("\n"),
    {
      title: label,
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "round",
      borderColor: isRevision ? "yellow" : "green",
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
    }
  );
}

function renderStagedPanel(photo, locationLabel) {
  const cats = Array.isArray(photo.categories) && photo.categories.length
    ? photo.categories.join(", ")
    : pc.dim("none");
  const descLines = photo.description
    ? wrapText(photo.description, 50).split("\n").join(`\n  ${"".padEnd(12)} `)
    : pc.dim("—");
  const rows = [
    ["Title",       photo.title || pc.dim("—")],
    ["Description", descLines],
    ["Location",    locationLabel],
    ["Categories",  cats],
    ["Size",        `${photo.width} × ${photo.height}`],
    ["Hero",        photo.hero ? pc.green("Yes") : pc.dim("No")],
    ["Mobile hero", photo.mobileHero ? pc.green("Yes") : pc.dim("No")],
  ];
  return boxen(
    rows.map(([label, val]) => `  ${pc.dim(label.padEnd(12))} ${val}`).join("\n"),
    {
      title: pc.yellow("  ✓ Staged  "),
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "round",
      borderColor: "yellow",
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
    }
  );
}

function renderSessionPanel(fileCount, dataPath, modelId) {
  return boxen(
    [
      `  ${pc.bold("New photos:")}  ${pc.cyan(pc.bold(String(fileCount)))}`,
      `  ${pc.bold("Data file:")}   ${pc.dim(path.relative(ROOT, dataPath))}`,
      `  ${pc.bold("AI model:")}    ${pc.dim(modelId)}`,
    ].join("\n"),
    {
      title: pc.bold("  Session  "),
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "double",
      borderColor: "magenta",
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
    }
  );
}

function renderSummaryPanel(addedPhotos) {
  const lines = addedPhotos.map((photo) => {
    const cats = Array.isArray(photo.categories) && photo.categories.length
      ? photo.categories.join(", ") : "—";
    return `  ${pc.green("✓")}  ${pc.bold(photo.title)}  ${pc.dim(`${photo.locationLabel} · ${cats}`)}`;
  });
  return boxen(lines.join("\n"), {
    title: pc.green(pc.bold(`  ${addedPhotos.length} Photo${addedPhotos.length !== 1 ? "s" : ""} Imported  `)),
    padding: { top: 1, bottom: 1, left: 0, right: 2 },
    borderStyle: "round",
    borderColor: "green",
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
  });
}

// ─── TUI primitives ───────────────────────────────────────────────────────────

function printBanner() {
  const lines = [
    `  ${pc.bold(pc.cyan("◆"))}  ${pc.bold("LOCAL PHOTO IMPORTER")}`,
    `  ${pc.dim("─────────────────────────────────────────────────")}`,
    `  ${pc.dim("Suhaib Khan Photography")}   ${pc.dim("·")}   ${pc.dim("Local images → portfolio data")}`,
  ];
  console.log(
    boxen(lines.join("\n"), {
      borderStyle: "double",
      borderColor: "cyan",
      padding: { top: 1, bottom: 1, left: 1, right: 4 },
      margin: { top: 1, bottom: 1 },
    })
  );
}

function printNote(message, title) {
  const content = typeof message === "string" ? `  ${message}` : message;
  console.log(
    boxen(content, {
      title: title ? pc.dim(`  ${title}  `) : undefined,
      borderStyle: "round",
      borderColor: "gray",
      padding: { top: 0, bottom: 0, left: 0, right: 2 },
      margin: { top: 0, bottom: 1 },
    })
  );
}

function printCancel(message = "Import cancelled.") {
  console.log("\n" + pc.red(`  ✖  ${pc.bold(message)}`) + "\n");
}

function printOutro(message) {
  console.log(
    boxen(`  ${pc.green("◆")}  ${pc.bold(pc.green(message))}`, {
      borderStyle: "round",
      borderColor: "green",
      padding: { top: 0, bottom: 0, left: 1, right: 3 },
      margin: { top: 1, bottom: 1 },
    })
  );
}

function printSubStep(label, step, total) {
  console.log(`\n  ${pc.cyan("›")} ${pc.dim(`[${step}/${total}]`)}  ${pc.bold(label)}`);
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

async function safeEnquirer(def) {
  try {
    const result = await enquirer.prompt(def);
    return result[def.name];
  } catch {
    printCancel("Import cancelled.");
    process.exit(0);
  }
}

async function promptText({ message, defaultValue = "", validate } = {}) {
  const result = await safeEnquirer({
    type: "input",
    name: "value",
    message,
    initial: defaultValue || undefined,
    validate: validate
      ? (v) => { const err = validate(v); return err === undefined ? true : err; }
      : undefined,
  });
  return String(result ?? "").trim();
}

async function promptConfirm(message, defaultYes = false) {
  const result = await safeEnquirer({
    type: "select",
    name: "value",
    message,
    initial: defaultYes ? 0 : 1,
    choices: [
      { name: "yes", message: pc.green("Yes") },
      { name: "no",  message: pc.dim("No") },
    ],
  });
  return result === "yes";
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function renderLocationPreview(draft) {
  return boxen(
    [
      `  ${pc.bold("Name:")}        ${draft.name}`,
      `  ${pc.bold("Short name:")}  ${draft.shortName}`,
      `  ${pc.bold("Slug (id):")}   ${pc.cyan(draft.id)}`,
      `  ${pc.bold("Description:")} ${draft.description || pc.dim("(empty)")}`,
    ].join("\n"),
    {
      title: pc.blue("  New Location  "),
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "round",
      borderColor: "blue",
      margin: { top: 1, bottom: 1 },
    }
  );
}

function renderCategoryPreview(draft) {
  return boxen(
    [
      `  ${pc.bold("Name:")}        ${draft.name}`,
      `  ${pc.bold("Slug (id):")}   ${pc.cyan(draft.id)}`,
      `  ${pc.bold("Description:")} ${draft.description || pc.dim("(empty)")}`,
    ].join("\n"),
    {
      title: pc.blue("  New Category  "),
      padding: { top: 1, bottom: 1, left: 0, right: 2 },
      borderStyle: "round",
      borderColor: "blue",
      margin: { top: 1, bottom: 1 },
    }
  );
}

async function promptLocationForm(existingIds) {
  const answers = await safeEnquirer({
    type: "form",
    name: "location",
    message: "New location  " + pc.dim("↑/↓ to move  ·  Enter to submit"),
    choices: [
      {
        name: "name",
        message: "Name",
        validate: (v) => v.trim() ? true : "Name is required.",
      },
      {
        name: "shortName",
        message: "Short name",
        hint: "compact UI label",
      },
      {
        name: "id",
        message: "Slug (id)",
        hint: "auto-generated if blank",
      },
      {
        name: "description",
        message: "Description",
        hint: "optional",
      },
    ],
  });

  const finalName      = (answers.name        || "").trim();
  const finalShortName = (answers.shortName   || finalName).trim();
  const autoId         = uniqueSlug(slugify(finalName) || "location", existingIds);
  const finalId        = uniqueSlug(slugify((answers.id || "").trim()) || autoId, existingIds);
  const finalDesc      = (answers.description || "").trim();
  const draft = { name: finalName, shortName: finalShortName, id: finalId, description: finalDesc };

  console.log(renderLocationPreview(draft));
  return draft;
}

async function promptCategoryForm(existingIds) {
  const answers = await safeEnquirer({
    type: "form",
    name: "category",
    message: "New category  " + pc.dim("↑/↓ to move  ·  Enter to submit"),
    choices: [
      {
        name: "name",
        message: "Name",
        validate: (v) => v.trim() ? true : "Name is required.",
      },
      {
        name: "id",
        message: "Slug (id)",
        hint: "auto-generated if blank",
      },
      {
        name: "description",
        message: "Description",
        hint: "optional",
      },
    ],
  });

  const finalName = (answers.name        || "").trim();
  const autoId    = uniqueSlug(slugify(finalName) || "category", existingIds);
  const finalId   = uniqueSlug(slugify((answers.id || "").trim()) || autoId, existingIds);
  const finalDesc = (answers.description || "").trim();
  const draft = { name: finalName, id: finalId, description: finalDesc };

  console.log(renderCategoryPreview(draft));
  return draft;
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, `${JSON.stringify({ locations: [], categories: [], photos: [] }, null, 2)}\n`, "utf8");
  }
}

async function readData() {
  await ensureDataFile();
  const parsed = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  if (!Array.isArray(parsed.locations))  parsed.locations  = [];
  if (!Array.isArray(parsed.categories)) parsed.categories = [];
  if (!Array.isArray(parsed.photos))     parsed.photos     = [];
  return parsed;
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function getPhotoFiles() {
  const entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

function findNewFiles(files, data) {
  const existingSrc       = new Set(data.photos.map((p) => p.src));
  const existingBasenames = new Set(data.photos.map((p) => p.src).filter(Boolean).map((s) => path.basename(s)));
  return files.filter((name) => {
    const relSrc = `images/photos/${name}`;
    return !existingSrc.has(relSrc) && !existingBasenames.has(name);
  });
}

function openImageIfSupported(absolutePath) {
  if (process.platform !== "darwin") return;
  spawnSync("open", [absolutePath], { stdio: "ignore" });
}

// ─── Location / category selection ───────────────────────────────────────────

async function chooseLocation(data) {
  if (data.locations.length > 0) {
    const selected = await safeEnquirer({
      type: "select",
      name: "value",
      message: "Select a location",
      choices: [
        { role: "separator", message: pc.dim(" ─── Existing ─────────────────────────────── ") },
        ...data.locations.map((loc) => ({
          name: loc.id,
          message: `${pc.bold(loc.name)}${loc.shortName && loc.shortName !== loc.name ? pc.dim(` · ${loc.shortName}`) : ""}`,
          hint: loc.description || undefined,
        })),
        { role: "separator", message: pc.dim(" ─── or ─────────────────────────────────────── ") },
        { name: "__new__", message: pc.cyan("+ Add new location…"), hint: "Define a new location entry" },
      ],
    });

    if (selected !== "__new__") {
      const loc = data.locations.find((l) => l.id === selected);
      if (!loc) throw new Error(`Unable to find selected location: ${selected}`);
      return { location: loc.id, locationLabel: loc.shortName || loc.name };
    }
  }

  const existingIds = new Set(data.locations.map((l) => l.id));
  const newLocation = await promptLocationForm(existingIds);
  data.locations.push(newLocation);
  return { location: newLocation.id, locationLabel: newLocation.shortName || newLocation.name };
}

async function chooseCategories(data) {
  const selectedIds = new Set();

  if (data.categories.length > 0) {
    const selected = await safeEnquirer({
      type: "multiselect",
      name: "value",
      message: "Select categories  (space to toggle, enter to confirm)",
      choices: data.categories.map((cat) => ({
        name: cat.id,
        message: `${pc.bold(cat.name)}  ${pc.dim(cat.id)}`,
      })),
    });
    selected.forEach((v) => selectedIds.add(v));
  }

  const shouldAddNew = data.categories.length === 0
    ? await promptConfirm("No categories yet — add one now?", true)
    : selectedIds.size === 0
      ? await promptConfirm("No category selected — add a new one?", true)
      : await promptConfirm("Also add a new category?", false);

  if (!shouldAddNew) return [...selectedIds];

  const existingIds = new Set(data.categories.map((c) => c.id));
  let addAnother = true;
  while (addAnother) {
    const newCat = await promptCategoryForm(existingIds);
    data.categories.push(newCat);
    existingIds.add(newCat.id);
    selectedIds.add(newCat.id);
    addAnother = await promptConfirm("Add another category?", false);
  }

  return [...selectedIds];
}

// ─── Lightroom export sync ────────────────────────────────────────────────────

async function checkLightroomExports() {
  // Silently skip if the Lightroom exports folder doesn't exist
  try {
    await fs.access(LIGHTROOM_DIR);
  } catch {
    return;
  }

  const [lrEntries, destEntries] = await Promise.all([
    fs.readdir(LIGHTROOM_DIR, { withFileTypes: true }),
    fs.readdir(PHOTOS_DIR,    { withFileTypes: true }).catch(() => []),
  ]);

  const destNames = new Set(
    destEntries.filter((e) => e.isFile()).map((e) => e.name)
  );
  const newFiles = lrEntries
    .filter((e) => e.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .filter((name) => !destNames.has(name))
    .sort((a, b) => a.localeCompare(b));

  if (!newFiles.length) {
    printNote(
      `  ${pc.dim("No new exports found in")} ${pc.dim(path.basename(LIGHTROOM_DIR))}`,
      "Lightroom"
    );
    return;
  }

  console.log(
    boxen(
      [
        `  ${pc.bold("Source:")}  ${pc.dim(LIGHTROOM_DIR)}`,
        `  ${pc.bold("New:")}     ${pc.cyan(pc.bold(String(newFiles.length)))} file${newFiles.length !== 1 ? "s" : ""} not yet in photos/`,
        "",
        ...newFiles.map((n) => `  ${pc.dim("·")}  ${n}`),
      ].join("\n"),
      {
        title: pc.bold(`  Lightroom Exports  `),
        padding: { top: 1, bottom: 1, left: 0, right: 2 },
        borderStyle: "round",
        borderColor: "magenta",
        margin: { top: 0, bottom: 1 },
      }
    )
  );

  const selected = await safeEnquirer({
    type: "multiselect",
    name: "value",
    message: `Select files to copy to photos/  ${pc.dim("(space to toggle, a to toggle all, enter to confirm)")}`,
    choices: newFiles.map((name) => ({ name, message: name, enabled: true })),
  });

  if (!selected.length) {
    printNote("No files selected — skipping Lightroom copy.", "Skipped");
    return;
  }

  const copySpinner = ora({ text: `Copying ${selected.length} file${selected.length !== 1 ? "s" : ""}…`, color: "magenta" }).start();
  let copied = 0;
  for (const name of selected) {
    await fs.copyFile(
      path.join(LIGHTROOM_DIR, name),
      path.join(PHOTOS_DIR,    name)
    );
    copied += 1;
    copySpinner.text = `Copying ${copied}/${selected.length}  ${pc.dim(name)}`;
  }
  copySpinner.succeed(`Copied ${copied} file${copied !== 1 ? "s" : ""} → ${pc.dim("public/images/photos/")}`);
}

// ─── Main flow ────────────────────────────────────────────────────────────────

async function importPhotos() {
  printBanner();

  await checkLightroomExports();

  const data     = await readData();
  const files    = await getPhotoFiles();
  const newFiles = findNewFiles(files, data);

  if (!newFiles.length) {
    printNote("No new files found in images/photos/.", "Nothing to import");
    printOutro("Done");
    return;
  }

  console.log(renderSessionPanel(newFiles.length, DATA_PATH, AI_MODEL_ID));

  const useAiSuggestions = await promptConfirm(
    `Use Gemini (${AI_MODEL_ID}) for AI copy suggestions?`, true
  );
  const openInPreview = await promptConfirm(
    "Open each image in macOS Preview?", process.platform === "darwin"
  );

  const addedPhotos = [];
  const totalSubSteps = 5;

  for (let index = 0; index < newFiles.length; index += 1) {
    const fileName = newFiles[index];
    const absPath  = path.join(PHOTOS_DIR, fileName);
    const localSrc = `images/photos/${fileName}`;

    // ── Photo header panel ──────────────────────────────────────────────────
    console.log(renderPhotoPanel(fileName, localSrc, index, newFiles.length));

    // ── Extract EXIF ────────────────────────────────────────────────────────
    const metaSpinner = ora({ text: "Reading EXIF metadata…", color: "cyan" }).start();
    let width = 0, height = 0, metadata = {};
    try {
      ({ width, height, metadata } = await extractMetadata(absPath));
      metaSpinner.succeed(`Dimensions ${pc.bold(`${width}×${height}`)}  ·  EXIF ready`);
    } catch {
      metaSpinner.warn(pc.dim("Metadata unavailable"));
    }
    console.log(renderMetadataPanel(metadata, width, height));

    // ── Open in Preview ─────────────────────────────────────────────────────
    if (openInPreview && process.platform === "darwin") {
      openImageIfSupported(absPath);
    }

    // ── Import gate ─────────────────────────────────────────────────────────
    const include = await promptConfirm("Import this photo?", true);
    if (!include) {
      printNote(`${pc.dim(fileName)} skipped.`, "Skipped");
      continue;
    }

    // ── Location ────────────────────────────────────────────────────────────
    printSubStep("Location", 1, totalSubSteps);
    const { location, locationLabel } = await chooseLocation(data);

    // ── Categories ──────────────────────────────────────────────────────────
    printSubStep("Categories", 2, totalSubSteps);
    const categories = await chooseCategories(data);

    // ── Copy: title & description ────────────────────────────────────────────
    printSubStep("Title & description", 3, totalSubSteps);
    const defaultTitle = path.parse(fileName).name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    let title       = "";
    let description = "";

    if (useAiSuggestions) {
      const userWords = await promptText({
        message: `Notes for AI  ${pc.dim("(mood, subject, story, focal point…)")}`,
      });

      let revisionNotes  = "";
      let isRevision     = false;
      let keepGenerating = true;

      while (keepGenerating) {
        const aiSpinner = ora({
          text: isRevision ? "Regenerating with your feedback…" : "Generating AI copy…",
          color: "cyan",
        }).start();

        try {
          const aiCopy = await generateAICopy({
            absolutePath: absPath, fileName, userWords,
            location: locationLabel, categories, metadata, revisionNotes,
          });
          aiSpinner.succeed("AI suggestion ready");
          console.log(renderAIPanel(aiCopy.title, aiCopy.description, isRevision));

          const aiChoice = await safeEnquirer({
            type: "select",
            name: "value",
            message: "Use this suggestion?",
            choices: [
              { name: "yes",    message: `${pc.green("✓")}  Accept`,        hint: "Save title and description as-is" },
              { name: "refine", message: `${pc.yellow("↺")}  Refine`,        hint: "Give feedback and regenerate" },
              { name: "manual", message: `${pc.dim("✎")}  Write manually`,  hint: "Enter your own copy" },
            ],
          });

          if (aiChoice === "yes") {
            title = aiCopy.title;
            description = aiCopy.description;
            keepGenerating = false;
          } else if (aiChoice === "manual") {
            title = await promptText({
              message: "Title",
              validate: (v) => v.trim() ? undefined : "Title is required.",
            });
            description = await promptText({ message: "Description" });
            keepGenerating = false;
          } else {
            revisionNotes = await promptText({
              message: `What should change?  ${pc.dim("(feedback for the AI)")}`,
            });
            isRevision = true;
          }
        } catch (error) {
          aiSpinner.fail(pc.red("AI generation failed"));
          printNote(String(error?.message || error), "AI error");
          const tryAgain = await promptConfirm("Try generating again?", false);
          if (!tryAgain) {
            printNote("Falling back to manual input.", "AI skipped");
            title = await promptText({
              message: "Title",
              defaultValue: defaultTitle,
              validate: (v) => v.trim() ? undefined : "Title is required.",
            });
            description = await promptText({ message: "Description" });
            keepGenerating = false;
          }
        }
      }
    } else {
      title = await promptText({
        message: "Title",
        defaultValue: defaultTitle,
        validate: (v) => v.trim() ? undefined : "Title is required.",
      });
      description = await promptText({ message: "Description" });
    }

    // ── Hero flags ───────────────────────────────────────────────────────────
    printSubStep("Hero / slideshow flags", 4, totalSubSteps);
    const hero       = await promptConfirm("Include in desktop hero slideshow?", false);
    const mobileHero = await promptConfirm("Include in mobile hero slideshow?", false);

    // ── Save ─────────────────────────────────────────────────────────────────
    printSubStep("Saving", 5, totalSubSteps);
    const photoEntry = { title, description, src: localSrc, width, height, location, categories, hero, mobileHero, metadata };
    data.photos.push(photoEntry);
    addedPhotos.push({ ...photoEntry, locationLabel });

    const saveSpinner = ora({ text: "Saving…", color: "green" }).start();
    await writeData(data);
    saveSpinner.succeed(`Saved  ${pc.dim(path.relative(ROOT, DATA_PATH))}`);

    console.log(renderStagedPanel(photoEntry, locationLabel));
  }

  if (!addedPhotos.length) {
    printNote("No photos were imported in this session.", "Result");
    printOutro("Done");
    return;
  }

  // Final write (deduplicates incremental saves)
  await writeData(data);
  console.log(renderSummaryPanel(addedPhotos));
  printOutro(`${addedPhotos.length} photo${addedPhotos.length !== 1 ? "s" : ""} saved → ${path.relative(ROOT, DATA_PATH)}`);
}

importPhotos().catch((error) => {
  console.error(pc.red("✖ Failed to import local photos."));
  console.error(error?.stack || error);
  process.exitCode = 1;
});