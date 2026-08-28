import { partImageSrc } from "../../lib/parts.js";

// Recolors a part's body using its own alpha channel as a mask, so the tint
// respects the artwork's silhouette. "multiply" keeps shading/linework
// visible under the tint instead of flattening it to a solid color.
export default function ObjectTint({ part, objectId, color, width, height }) {
  if (!color) return null;
  // Keyed by the object instance, not the part type — several instances of
  // the same colorable part must not share one <mask> id.
  const maskId = `tint-mask-${objectId}`;

  return (
    <>
      <defs>
        <mask id={maskId} maskContentUnits="userSpaceOnUse">
          <image
            href={partImageSrc(part)}
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            preserveAspectRatio="none"
          />
        </mask>
      </defs>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={color}
        mask={`url(#${maskId})`}
        style={{ mixBlendMode: "multiply", pointerEvents: "none" }}
      />
    </>
  );
}
