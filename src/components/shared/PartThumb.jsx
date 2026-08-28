import { useId } from "react";
import { partImageSrc } from "../../lib/parts.js";
import { frameIndexFor } from "../../lib/spritesheet.js";
import { useImageSize } from "../../lib/useImageSize.js";

const TEXT_PREVIEW = { 13: { weight: 700, size: "60%" }, 14: { weight: 500, size: "38%" } };

// A representative object, purely for frameIndexFor's default-variant math —
// used when no real object exists yet (e.g. a palette thumbnail). Pass the
// actual object (e.g. from the Inspector) to crop to its real variant/frame
// instead of the default one.
const DEFAULT_OBJECT = { settings: {} };

export default function PartThumb({ part, object = DEFAULT_OBJECT }) {
  const preview = TEXT_PREVIEW[part.builtinId];
  const src = partImageSrc(part);
  const natural = useImageSize(preview ? null : src);
  const clipId = useId();

  if (preview) {
    return (
      <div className="part-thumb-text" style={{ fontWeight: preview.weight, fontSize: preview.size }}>
        {part.defaultLabel?.text || part.name}
      </div>
    );
  }

  if (part.spritesheet && natural) {
    const { frameWidth, frameHeight } = part.spritesheet;
    const frames = Math.round(natural.width / frameWidth);
    const frameIndex = Math.min(frameIndexFor(part, object), frames - 1);
    return (
      <svg className="part-thumb-frame" viewBox={`0 0 ${frameWidth} ${frameHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* preserveAspectRatio only scales+centers the viewBox — it does NOT
            clip to it. When the thumbnail box's aspect ratio differs from a
            single frame's (true for every spritesheet part here), the
            unclipped letterbox space still exposes neighboring frames, so
            the crop needs an explicit clipPath matching the frame rect. */}
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={frameWidth} height={frameHeight} />
          </clipPath>
        </defs>
        <image
          href={src}
          x={-frameIndex * frameWidth}
          y={0}
          width={natural.width}
          height={natural.height}
          clipPath={`url(#${clipId})`}
        />
      </svg>
    );
  }

  return <img src={src} alt="" draggable={false} />;
}
