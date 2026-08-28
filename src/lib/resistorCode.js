// Standard 3-band (digit, digit, multiplier) resistor color code.
export function ohmsToBands(ohms) {
  if (!ohms || ohms <= 0) return { digit1: 0, digit2: 0, exponent: 0 };
  let value = ohms;
  let exponent = 0;
  while (value >= 100) {
    value /= 10;
    exponent++;
  }
  while (value < 10) {
    value *= 10;
    exponent--;
  }
  exponent = Math.max(0, exponent);
  const rounded = Math.round(value);
  const digit1 = Math.floor(rounded / 10);
  const digit2 = rounded % 10;
  return { digit1, digit2, exponent: Math.min(9, exponent) };
}

export function formatOhms(ohms) {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(ohms % 1e6 === 0 ? 0 : 1)}MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(ohms % 1e3 === 0 ? 0 : 1)}kΩ`;
  return `${ohms}Ω`;
}
