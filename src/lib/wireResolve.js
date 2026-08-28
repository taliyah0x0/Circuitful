import { getCachedSize } from "./useImageSize.js";
import { objectSize, partPins, pinWorldPosition, partImageSrc } from "./parts.js";

export function nativeSizeFor(part) {
  const raw = getCachedSize(partImageSrc(part));
  if (!raw) return { width: 100, height: 100 };
  if (part.spritesheet) return { width: part.spritesheet.frameWidth, height: part.spritesheet.frameHeight };
  return raw;
}

export function resolveNodePosition(node, doc, partsById, catalogMeta) {
  if (!node.attach) return { x: node.x, y: node.y };
  const object = doc.objects.find((o) => o.id === node.attach.objectId);
  if (!object) return { x: node.x, y: node.y };
  const part = partsById.get(object.partId);
  if (!part) return { x: node.x, y: node.y };
  const size = objectSize(part, object, nativeSizeFor(part));
  const pins = partPins(part, object, catalogMeta);
  const pin = pins[node.attach.pinIndex];
  if (!pin) return { x: object.x, y: object.y };
  return pinWorldPosition(part, object, pin, size);
}

// Finding a wire endpoint by exact hover is brittle — fast pointer movement
// can skip right over a small target without ever firing pointerenter. This
// searches every pin on every object for whichever is physically closest to
// a world point, within a generous radius, so releasing "near enough" still
// connects.
export function findNearestPin(worldPos, doc, partsById, catalogMeta, maxDist = 28) {
  let best = null;
  let bestDist = maxDist;
  for (const object of doc.objects) {
    const part = partsById.get(object.partId);
    if (!part) continue;
    const size = objectSize(part, object, nativeSizeFor(part));
    const pins = partPins(part, object, catalogMeta);
    pins.forEach((pin, pinIndex) => {
      const world = pinWorldPosition(part, object, pin, size);
      const dist = Math.hypot(world.x - worldPos.x, world.y - worldPos.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = { objectId: object.id, pinIndex, world };
      }
    });
  }
  return best;
}
