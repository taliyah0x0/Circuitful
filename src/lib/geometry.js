export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function rotatePoint(x, y, cx, cy, angleDeg) {
  const rad = degToRad(angleDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

export function normalizeAngle(deg) {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

export function pinWorldPosition(object, pin) {
  const local = {
    x: pin.x * object.width * object.scale,
    y: pin.y * object.height * object.scale,
  };
  const rotated = rotatePoint(local.x, local.y, 0, 0, object.rotation || 0);
  return {
    x: object.x + rotated.x,
    y: object.y + rotated.y,
  };
}

export function boundsOfRect(x1, y1, x2, y2) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
