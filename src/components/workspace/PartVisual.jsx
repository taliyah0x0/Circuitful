import { useImageSize } from "../../lib/useImageSize.js";
import { frameIndexFor } from "../../lib/spritesheet.js";
import { partImageSrc } from "../../lib/parts.js";

// Renders a part's artwork centered at local (0,0), sized `width`x`height` (already
// scaled by caller). Handles the three multi-frame built-ins transparently.
export default function PartVisual({ part, object = {}, width, height }) {
  const src = partImageSrc(part);
  const natural = useImageSize(src);

  if (!natural) return null;

  if (part.spritesheet) {
    const { frameWidth, frameHeight } = part.spritesheet;
    const frames = Math.round(natural.width / frameWidth);
    const frameIndex = Math.min(frameIndexFor(part, object), frames - 1);
    const scaleX = width / frameWidth;
    const scaleY = height / frameHeight;
    return (
      <svg x={-width / 2} y={-height / 2} width={width} height={height} viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
        <image
          href={src}
          x={-frameIndex * frameWidth}
          y={0}
          width={natural.width}
          height={natural.height}
          preserveAspectRatio="none"
        />
      </svg>
    );
  }

  return (
    <image
      href={src}
      x={-width / 2}
      y={-height / 2}
      width={width}
      height={height}
      preserveAspectRatio="none"
    />
  );
}

// Size to use for scale math: a single frame for spritesheet parts, else the
// whole image.
export function useNativeSize(part) {
  const raw = useImageSize(partImageSrc(part));
  if (!raw) return null;
  if (part.spritesheet) return { width: part.spritesheet.frameWidth, height: part.spritesheet.frameHeight };
  return raw;
}
