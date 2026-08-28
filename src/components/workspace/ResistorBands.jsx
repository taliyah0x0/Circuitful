import { usePartsLibrary } from "../../state/partsLibraryStore.js";
import { ohmsToBands } from "../../lib/resistorCode.js";

const DIGIT_COLORS_START = 1; // resistorColors[0] is gold, [1..10] are digit 0-9

// Normalized (fraction of the sprite frame) position of the two transparent
// gaps baked into the resistor artwork — measured directly from parts/2.png.
// The frame's own bottom band (selected via frameIndexFor) already encodes
// the exponent digit, so only digit1/digit2 need to be drawn here.
const GAP_1 = { cx: -0.005, cy: -0.0589622641509434, width: 0.32, height: 0.05660377358490566 };
const GAP_2 = { cx: -0.005, cy: 0.04952830188679245, width: 0.32, height: 0.05660377358490566 };

export default function ResistorBands({ object, width, height }) {
  const resistorColors = usePartsLibrary((s) => s.builtinMeta?.resistorColors) || [];
  if (resistorColors.length < 11) return null;

  const ohms = object.settings?.resistorOhms ?? 220;
  const { digit1, digit2 } = ohmsToBands(ohms);
  const bands = [
    { gap: GAP_1, color: resistorColors[DIGIT_COLORS_START + digit1] },
    { gap: GAP_2, color: resistorColors[DIGIT_COLORS_START + digit2] },
  ];

  return (
    <g>
      {bands.map(({ gap, color }, i) => (
        <rect
          key={i}
          x={gap.cx * width - (gap.width * width) / 2}
          y={gap.cy * height - (gap.height * height) / 2}
          width={gap.width * width}
          height={gap.height * height}
          fill={color}
        />
      ))}
    </g>
  );
}
