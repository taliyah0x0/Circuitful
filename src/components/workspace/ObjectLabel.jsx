// Per-part tweaks to the label positions/sizes inherited from the original
// app's data — some were cramped or overlapped the artwork.
const LABEL_OVERRIDES = {
  4: { fontScale: 2.2, minFont: 18 }, // Button
  5: { fontScale: 1.8, side: "right", minFont: 14 }, // Diode
  8: { fontScale: 1.8, side: "right", minFont: 14 }, // Capacitor
  12: { fontScale: 2, minFont: 20 }, // IC Chip
  13: { fontScale: 1.6, minFont: 16 }, // Large Text / Heading
  14: { fontScale: 2.2, minFont: 22 }, // Small Text
};

// These parts' label color follows the app's light/dark theme by default
// (black on light, white on dark) instead of the fixed color baked into the
// original data — Heading/Small Text can still be overridden explicitly via
// the inspector's label-color picker.
const THEME_AWARE_LABEL_IDS = new Set([5, 8, 13, 14]);

export default function ObjectLabel({ part, object, size }) {
  const def = part.defaultLabel;
  if (!def) return null;

  const text = object.settings?.label ?? def.text;
  if (!text) return null;

  const override = LABEL_OVERRIDES[part.builtinId];
  const fontSize = Math.max(
    override?.minFont || 13,
    def.fontSize * Math.max(size.width, size.height) * (override?.fontScale || 1)
  );
  const color =
    object.settings?.labelColor || (THEME_AWARE_LABEL_IDS.has(part.builtinId) ? "var(--text)" : def.color);

  let x, y, textAnchor, counterRotate;
  if (override?.side === "right") {
    // Fixed to the part's own right edge, in its local (unrotated) frame —
    // moves with the part as it rotates, but the text itself stays upright.
    x = size.width / 2 + fontSize * 0.5;
    y = 0;
    textAnchor = "start";
    counterRotate = -object.rotation;
  } else {
    const angleIndex = Math.round((object.rotation % 360) / 90) % 4;
    const offset = def.offsetsByAngle[angleIndex] || { x: 0, y: 0 };
    x = offset.x * size.width;
    y = offset.y * size.height;
    textAnchor = "middle";
    counterRotate = def.rotateWithObject ? 0 : -object.rotation;
  }

  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      textAnchor={textAnchor}
      dominantBaseline="middle"
      transform={counterRotate ? `rotate(${counterRotate} ${x} ${y})` : undefined}
      style={{ pointerEvents: "none", userSelect: "none", fontFamily: "Sans, sans-serif", fill: color }}
    >
      {text}
    </text>
  );
}
