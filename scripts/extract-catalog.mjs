// Reads the ORIGINAL Circuitful source (read-only) and produces a clean JSON parts
// catalog + copies part images into this project's public/ folder. Run with:
//   node scripts/extract-catalog.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ORIG = "/Users/taliyahhuang/Documents/VS Code/Circuitful 8:7:2022";

const src = fs.readFileSync(path.join(ORIG, "Workspace.js"), "utf8");

function extractBalanced(startIdx, openChar, closeChar) {
  let depth = 0;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === openChar) depth++;
    if (src[i] === closeChar) {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  throw new Error("unbalanced structure starting at " + startIdx);
}

function extractDeclaration(varName, openChar, closeChar) {
  const re = new RegExp(`(?:let|var)\\s+${varName}\\s*=\\s*\\${openChar}`);
  const m = re.exec(src);
  if (!m) throw new Error(`could not find declaration for ${varName}`);
  const openIdx = m.index + m[0].length - 1;
  return extractBalanced(openIdx, openChar, closeChar);
}

function toJs(objLiteralSource) {
  // eslint-disable-next-line no-new-func
  return new Function(`return (${objLiteralSource});`)();
}

const wiringXPoints = toJs(extractDeclaration("wiringXPoints", "{", "}"));
const wiringYPoints = toJs(extractDeclaration("wiringYPoints", "{", "}"));
const objectsDataFlat = toJs(extractDeclaration("objectsData", "[", "]"));
const powerObjectsFlat = toJs(extractDeclaration("powerObjects", "[", "]"));
const groundObjectsFlat = toJs(extractDeclaration("groundObjects", "[", "]"));
const powerPins = toJs(extractDeclaration("powerPins", "{", "}"));
const gndPins = toJs(extractDeclaration("gndPins", "{", "}"));
const defaultLabelFlat = toJs(extractDeclaration("defaultLabel", "[", "]"));
const buttonxPoints = toJs(extractDeclaration("buttonxPoints", "{", "}"));
const buttonyPoints = toJs(extractDeclaration("buttonyPoints", "{", "}"));
const ICxPoints = toJs(extractDeclaration("ICxPoints", "{", "}"));
const ICyPoints = toJs(extractDeclaration("ICyPoints", "{", "}"));
const paletteColors = toJs(extractDeclaration("paletteColors", "[", "]"));
const customObjectColors = toJs(extractDeclaration("customObjectColors", "[", "]"));
const resistorColorsFlat = toJs(extractDeclaration("resistorColors", "[", "]"));

const SPRITESHEETS = {
  2: { frameWidth: 100, frameHeight: 212 }, // Resistor: color-band frames
  4: { frameWidth: 75, frameHeight: 95 }, // Button: pressed/unpressed frames
  12: { frameWidth: 384, frameHeight: 150 }, // IC Chip: pin-count variant frames
};

function hex(n) {
  return "#" + n.toString(16).padStart(6, "0");
}

// --- defaultLabel: flat array in groups of 14 ---
// [objectID, text, fontSize, textLength, rotateWithObject,
//  angle0X, angle0Y, angle90X, angle90Y, angle180X, angle180Y, angle270X, angle270Y, color]
const labelsByObjectId = {};
for (let i = 0; i < defaultLabelFlat.length; i += 14) {
  const objectID = defaultLabelFlat[i];
  labelsByObjectId[objectID] = {
    text: defaultLabelFlat[i + 1],
    fontSize: defaultLabelFlat[i + 2],
    maxLength: defaultLabelFlat[i + 3],
    rotateWithObject: defaultLabelFlat[i + 4],
    offsetsByAngle: [
      { x: defaultLabelFlat[i + 5], y: defaultLabelFlat[i + 6] },
      { x: defaultLabelFlat[i + 7], y: defaultLabelFlat[i + 8] },
      { x: defaultLabelFlat[i + 9], y: defaultLabelFlat[i + 10] },
      { x: defaultLabelFlat[i + 11], y: defaultLabelFlat[i + 12] },
    ],
    color: hex(defaultLabelFlat[i + 13]),
  };
}

// --- powerObjects / groundObjects: flat [objectID, count, objectID, count, ...] ---
function pairsToMap(flat) {
  const map = {};
  for (let i = 0; i < flat.length; i += 2) map[flat[i]] = flat[i + 1];
  return map;
}
const powerCounts = pairsToMap(powerObjectsFlat);
const groundCounts = pairsToMap(groundObjectsFlat);

// --- Build parts list. Only keep the BASE (unrotated) pin set per part —
// the original duplicated 3 more rotated copies at runtime; the rewrite
// rotates via a single SVG transform instead, so we only need the base set. ---
const CATEGORIES = ["Microcontrollers", "Electrical", "Modules", "Other"];
const parts = [];
const partCount = objectsDataFlat.length / 5;

for (let i = 0; i < partCount; i++) {
  const name = objectsDataFlat[i * 5];
  const category = objectsDataFlat[i * 5 + 1];
  const scale = objectsDataFlat[i * 5 + 2];
  const pinCount = objectsDataFlat[i * 5 + 3];
  // objectsDataFlat[i*5+4] (a browser-viewport-width snapshot at export time) is
  // dead data in the original app (never read back) — intentionally dropped here.

  const xs = (wiringXPoints[`x${i}`] || []).slice(0, pinCount);
  const ys = (wiringYPoints[`y${i}`] || []).slice(0, pinCount);
  const powerIdx = new Set((powerPins[`p${i}`] || []));
  const groundIdx = new Set((gndPins[`g${i}`] || []));

  const pins = xs.map((x, idx) => ({
    x,
    y: ys[idx],
    role: powerIdx.has(idx) ? "power" : groundIdx.has(idx) ? "ground" : null,
  }));

  const part = {
    id: `builtin-${i}`,
    builtinId: i,
    name,
    category: CATEGORIES.includes(category) ? category : "Other",
    scale,
    pinCount,
    image: `parts/${i}.png`,
    pins,
  };

  if (SPRITESHEETS[i]) part.spritesheet = SPRITESHEETS[i];
  if (labelsByObjectId[i]) part.defaultLabel = labelsByObjectId[i];
  if (powerCounts[i] !== undefined) part.powerPointCount = powerCounts[i];
  if (groundCounts[i] !== undefined) part.groundPointCount = groundCounts[i];

  parts.push(part);
}

function pinVariantMap(xMap, yMap) {
  const out = {};
  for (const key of Object.keys(xMap)) {
    const n = Number(key.replace("pin", ""));
    const xs = xMap[key].slice(0, n);
    const ys = yMap[key].slice(0, n);
    out[n] = xs.map((x, idx) => ({ x, y: ys[idx] }));
  }
  return out;
}

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  categories: CATEGORIES,
  palette: paletteColors.map(hex),
  resistorColors: resistorColorsFlat.map(hex),
  customObjectColorDefaults: customObjectColors.map(hex),
  buttonPinVariants: pinVariantMap(buttonxPoints, buttonyPoints),
  icPinVariants: pinVariantMap(ICxPoints, ICyPoints),
  parts,
};

// --- Write catalog.json ---
const dataDir = path.join(ROOT, "public", "data");
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "catalog.json"), JSON.stringify(catalog, null, 2));
console.log(`Wrote ${parts.length} parts to public/data/catalog.json`);

// --- Copy part images ---
const partsImgSrcDir = path.join(ORIG, "workspace-objects");
const partsImgDstDir = path.join(ROOT, "public", "parts");
fs.mkdirSync(partsImgDstDir, { recursive: true });
let copied = 0;
for (let i = 0; i < partCount; i++) {
  const src = path.join(partsImgSrcDir, `${i}.png`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(partsImgDstDir, `${i}.png`));
    copied++;
  } else {
    console.warn(`Missing image for part ${i} (${catalog.parts[i]?.name}): ${src}`);
  }
}
console.log(`Copied ${copied}/${partCount} part images to public/parts/`);

// --- Copy hand-authored info pages (object-information/N/*) ---
const infoSrcDir = path.join(ORIG, "object-information");
const infoDstDir = path.join(ROOT, "public", "info");
fs.mkdirSync(infoDstDir, { recursive: true });
if (fs.existsSync(infoSrcDir)) {
  for (const entry of fs.readdirSync(infoSrcDir)) {
    const srcSub = path.join(infoSrcDir, entry);
    if (!fs.statSync(srcSub).isDirectory()) continue;
    const dstSub = path.join(infoDstDir, entry);
    fs.mkdirSync(dstSub, { recursive: true });
    for (const file of fs.readdirSync(srcSub)) {
      if (file === ".DS_Store") continue;
      fs.copyFileSync(path.join(srcSub, file), path.join(dstSub, file));
    }
  }
  console.log(`Copied info pages to public/info/`);
}
