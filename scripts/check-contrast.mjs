/**
 * Measures WCAG 2.2 contrast for every colour pair the UI actually uses.
 * Run: node scripts/check-contrast.mjs
 * Exits non-zero when a required pair fails.
 */
const themes = {
  light: {
    ground: "#fbfaf7",
    surface: "#f4f2ec",
    raised: "#fffdfa",
    ink: "#1b2422",
    inkMuted: "#56625f",
    inkSubtle: "#68736f",
    primary: "#1d5c57",
    onPrimary: "#fbfaf7",
    primaryHover: "#174a46",
    primarySoft: "#e4edea",
    onPrimarySoft: "#1b3d39",
    accent: "#6a5d8b",
    onAccent: "#fbfaf7",
    line: "#e4e0d7",
    lineStrong: "#7d8783",
    danger: "#9c3b33",
    onDanger: "#fdf6f4",
    focus: "#6a5d8b",
  },
  dark: {
    ground: "#101514",
    surface: "#161c1b",
    raised: "#1c2321",
    ink: "#edf1ee",
    inkMuted: "#a6b1ad",
    inkSubtle: "#8e9a95",
    primary: "#63b0a5",
    onPrimary: "#0b1a17",
    primaryHover: "#7cc2b7",
    primarySoft: "#1e2c29",
    onPrimarySoft: "#c6e3dc",
    accent: "#b3a6d4",
    onAccent: "#171325",
    line: "#2a3331",
    lineStrong: "#6b7672",
    danger: "#e88c82",
    onDanger: "#2a0f0c",
    focus: "#b3a6d4",
  },
};

/** [foreground, background, minimum ratio, label] */
const pairs = [
  ["ink", "ground", 4.5, "body text on page"],
  ["ink", "surface", 4.5, "body text on surface"],
  ["ink", "raised", 4.5, "body text on raised"],
  ["inkMuted", "ground", 4.5, "muted text on page"],
  ["inkMuted", "surface", 4.5, "muted text on surface"],
  ["inkMuted", "raised", 4.5, "muted text on raised"],
  ["inkSubtle", "ground", 4.5, "subtle text on page"],
  ["inkSubtle", "raised", 4.5, "subtle text on raised"],
  ["onPrimary", "primary", 4.5, "primary button label"],
  ["onPrimary", "primaryHover", 4.5, "primary button hover label"],
  ["primary", "ground", 4.5, "primary text on page"],
  ["primary", "surface", 4.5, "primary text on surface"],
  ["primary", "raised", 4.5, "primary text on raised"],
  ["onPrimarySoft", "primarySoft", 4.5, "soft surface text"],
  ["onAccent", "accent", 4.5, "accent button label"],
  ["accent", "ground", 4.5, "accent text on page"],
  ["accent", "raised", 4.5, "accent text on raised"],
  ["onDanger", "danger", 4.5, "danger button label"],
  ["danger", "ground", 4.5, "danger text on page"],
  ["lineStrong", "ground", 3, "control border"],
  ["focus", "ground", 3, "focus ring on page"],
  ["focus", "raised", 3, "focus ring on raised"],
];

function srgb(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

let failures = 0;
for (const [themeName, theme] of Object.entries(themes)) {
  console.log(`\n${themeName.toUpperCase()}`);
  for (const [fg, bg, min, label] of pairs) {
    const value = ratio(theme[fg], theme[bg]);
    const ok = value >= min;
    if (!ok) failures += 1;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${value.toFixed(2)}:1  (${min}:1)  ${label}  ${fg} on ${bg}`,
    );
  }
}

console.log(
  failures === 0
    ? "\nAll required pairs pass."
    : `\n${failures} pair(s) below the required ratio.`,
);
process.exit(failures === 0 ? 0 : 1);
