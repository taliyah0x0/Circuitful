import { objectSize } from "./parts.js";
import { nativeSizeFor, resolveNodePosition } from "./wireResolve.js";

export function computeSceneBounds(doc, partsById, catalogMeta) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function include(x, y) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  for (const object of doc.objects) {
    const part = partsById.get(object.partId);
    if (!part) continue;
    const size = objectSize(part, object, nativeSizeFor(part));
    const radius = 0.5 * Math.hypot(size.width, size.height);
    include(object.x - radius, object.y - radius);
    include(object.x + radius, object.y + radius);
  }

  for (const node of doc.nodes) {
    const pos = resolveNodePosition(node, doc, partsById, catalogMeta);
    include(pos.x, pos.y);
  }

  if (!isFinite(minX)) return { x: 0, y: 0, width: 400, height: 300 };

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
