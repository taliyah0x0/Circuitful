import { ohmsToBands } from "./resistorCode.js";

// The three built-in parts exported as multi-frame strips by the original app:
//   Resistor (id 2): 10 body frames, one per multiplier/exponent digit (0-9) —
//     the frame's baked-in bottom band recolors to match. Two more bands
//     (the value's first two digits) are drawn at runtime over transparent
//     gaps in the art — see ResistorBands.
//   Button (id 4): 2 frames — left half for the 2-pin variant, right half
//     for the 4-pin variant.
//   IC Chip (id 12): 7 frames, one per pin-count variant [4,6,8,10,12,14,16].
const IC_PIN_VARIANTS = [4, 6, 8, 10, 12, 14, 16];
const BUTTON_PIN_VARIANTS = [2, 4];

export function frameIndexFor(part, object) {
  if (part.builtinId === 2) {
    const { exponent } = ohmsToBands(object.settings?.resistorOhms ?? 220);
    return exponent;
  }
  if (part.builtinId === 4) {
    const n = object.settings?.pinVariant || part.pinCount;
    const idx = BUTTON_PIN_VARIANTS.indexOf(n);
    return idx >= 0 ? idx : 0;
  }
  if (part.builtinId === 12) {
    const n = object.settings?.pinVariant || part.pinCount;
    const idx = IC_PIN_VARIANTS.indexOf(n);
    return idx >= 0 ? idx : 0;
  }
  return 0;
}
