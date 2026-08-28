import { rotatePoint } from "./geometry.js";

export const GRID_SIZE = 28;
export const CATEGORIES = ["Microcontrollers", "Electrical", "Modules", "Other"];

// Built-in parts reference a static /parts/N.png path; custom (user-authored)
// parts carry their image inline as a data URL instead.
export function partImageSrc(part) {
  return part.imageDataUrl || `/${part.image}`;
}

// Built-ins whose body is meaningfully recolorable (indicator lights, battery
// shells, RGB modules) — matches the original app's per-object tint feature.
// Custom parts are always colorable since the author controls the artwork.
// 20 = "4 Pin LED", the RGB LED package (2-pin LED is single-color only).
const COLORABLE_BUILTIN_IDS = new Set([3, 6, 7, 20, 32, 45, 46, 47, 48]);

export function isColorable(part) {
  if (part.isCustom) return true;
  return part.builtinId !== undefined && COLORABLE_BUILTIN_IDS.has(part.builtinId);
}

export function partPins(part, object, catalogMeta) {
  if (part.builtinId === 4 && catalogMeta?.buttonPinVariants) {
    const n = object.settings?.pinVariant || part.pinCount;
    const variant = catalogMeta.buttonPinVariants[n];
    if (variant) return variant.map((p) => ({ ...p, role: null }));
  }
  if (part.builtinId === 12 && catalogMeta?.icPinVariants) {
    const n = object.settings?.pinVariant || part.pinCount;
    const variant = catalogMeta.icPinVariants[n];
    if (variant) return variant.map((p) => ({ ...p, role: null }));
  }
  return part.pins;
}

// World-space size of an object's bounding box (before rotation).
export function objectSize(part, object, nativeSize) {
  const scale = part.scale * (object.scale || 1);
  return {
    width: nativeSize.width * scale,
    height: nativeSize.height * scale,
  };
}

export function pinWorldPosition(part, object, pin, size) {
  const local = { x: pin.x * size.width, y: pin.y * size.height };
  const rotated = rotatePoint(local.x, local.y, 0, 0, object.rotation || 0);
  return { x: object.x + rotated.x, y: object.y + rotated.y };
}

export function snap(value, gridSize = GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize;
}

// Snapping an object's own center to the grid doesn't put its pins on grid
// lines — each part's pins sit at whatever fractional offset the artwork
// happened to be drawn at. Anchoring on the part's first pin instead (snap
// the pin, then shift the object by the same delta) means wiring points
// land on the grid, which is what actually matters for tidy wiring.
export function snapObjectToPinGrid(part, object, nativeSize, gridSize = GRID_SIZE) {
  const pins = part.pins;
  if (!pins || !pins.length) {
    return { x: snap(object.x, gridSize), y: snap(object.y, gridSize) };
  }
  const size = objectSize(part, object, nativeSize);
  const pin0World = pinWorldPosition(part, object, pins[0], size);
  const snappedPin = { x: snap(pin0World.x, gridSize), y: snap(pin0World.y, gridSize) };
  return {
    x: object.x + (snappedPin.x - pin0World.x),
    y: object.y + (snappedPin.y - pin0World.y),
  };
}

export function nextRotation(current, dir) {
  const steps = [0, 90, 180, 270];
  const idx = steps.indexOf(current);
  const nextIdx = (idx + (dir > 0 ? 1 : -1) + 4) % 4;
  return steps[nextIdx];
}
