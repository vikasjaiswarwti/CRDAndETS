// Speed → colour stops (km/h, rgb). Colour is interpolated linearly between
// neighbouring stops, clamped at the ends.
//   0-13        : violet -> violet shade
//   13-22       : violet shade -> blue shade -> blue
//   22-30       : blue -> blue-green -> green -> green-yellow
//   30-45       : yellow -> yellow-orange -> orange
//   >45         : red -> dark red
const COLOR_STOPS: { value: number; rgb: [number, number, number] }[] = [
  { value: 0, rgb: [74, 20, 140] }, // violet
  { value: 6.5, rgb: [123, 31, 162] }, // violet shade
  { value: 13, rgb: [156, 39, 176] }, // violet shade
  { value: 17.5, rgb: [121, 85, 183] }, // violet-blue shade
  { value: 22, rgb: [33, 150, 243] }, // blue
  { value: 24.67, rgb: [0, 172, 193] }, // blue-green
  { value: 27.33, rgb: [76, 175, 80] }, // green
  { value: 30, rgb: [205, 220, 57] }, // green-yellow
  { value: 30.01, rgb: [255, 235, 59] }, // yellow
  { value: 37.5, rgb: [255, 193, 7] }, // yellow-orange
  { value: 45, rgb: [251, 140, 0] }, // orange
  { value: 45.01, rgb: [239, 83, 80] }, // red
  { value: 70, rgb: [183, 28, 28] }, // dark red
];

// Fixed speed bands (for the legend) — 0-15, then every 5 km/h up to the 70 km/h max.
export const SPEED_BANDS: { max: number; label: string }[] = [
  { max: 15, label: "0-15" },
  { max: 20, label: "15-20" },
  { max: 25, label: "20-25" },
  { max: 30, label: "25-30" },
  { max: 35, label: "30-35" },
  { max: 40, label: "35-40" },
  { max: 45, label: "40-45" },
  { max: 50, label: "50-60" },
  { max: Infinity, label: "60-70" },
];

export const getSpeedBandIndex = (value: number) =>
  Math.max(
    0,
    SPEED_BANDS.findIndex((band) => value < band.max),
  );

const rgbAt = (value: number): [number, number, number] => {
  const stops = COLOR_STOPS;
  if (value <= stops[0].value) return stops[0].rgb;
  if (value >= stops[stops.length - 1].value) return stops[stops.length - 1].rgb;

  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (value >= a.value && value <= b.value) {
      const t = b.value > a.value ? (value - a.value) / (b.value - a.value) : 0;
      return a.rgb.map((c, k) => Math.round(c + (b.rgb[k] - c) * t)) as [
        number,
        number,
        number,
      ];
    }
  }
  return stops[stops.length - 1].rgb;
};

// Background + readable text colour for a given speed (km/h).
export const getSpeedColor = (value: number) => {
  const [r, g, b] = rgbAt(value);
  // Perceived luminance decides dark vs light text.
  const isLight = 0.299 * r + 0.587 * g + 0.114 * b > 150;
  return {
    background: `rgb(${r}, ${g}, ${b})`,
    color: isLight ? "#1a202c" : "#ffffff",
    fontSize: 10,
  };
};

export const SPEED_LEGEND_ITEMS = SPEED_BANDS.map((band, index) => {
  const prevMax = index === 0 ? 0 : SPEED_BANDS[index - 1].max;
  const sampleValue = Number.isFinite(band.max)
    ? (prevMax + band.max) / 2
    : prevMax + 2.5;
  const [r, g, b] = rgbAt(sampleValue);
  return { label: band.label, color: `rgb(${r}, ${g}, ${b})` };
});

// 0 → "12:00am", 14 → "02:00pm"
export const formatHour = (hour: number) => {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, "0")}:00${hour < 12 ? "am" : "pm"}`;
};
