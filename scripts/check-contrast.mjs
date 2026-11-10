/**
 * Measures WCAG 2.2 contrast for every colour pair the UI actually uses.
 * Run: node scripts/check-contrast.mjs
 * Exits non-zero when a required pair fails.
 */
const themes = {
  light: {
    ground: "#f1f7f2",
    surface: "#e4eee5",
    raised: "#fbfefb",
    ink: "#1c2a22",
    inkMuted: "#4f6357",
    inkSubtle: "#5f7468",
    primary: "#2f6b46",
    onPrimary: "#f7fbf7",
    primaryHover: "#275a3a",
    primarySoft: "#dbeade",
    onPrimarySoft: "#20402b",
    accent: "#6d5c88",
    onAccent: "#f8f6fb",
    line: "#dbe6dc",
    lineStrong: "#6e857a",
    danger: "#a14b43",
    onDanger: "#fdf5f3",
    focus: "#6d5c88",
  },
  dark: {
    ground: "#101815",
    surface: "#16201b",
    raised: "#1b2721",
    ink: "#e7f1e9",
    inkMuted: "#a4b9ab",
    inkSubtle: "#8ba394",
    primary: "#83c79a",
    onPrimary: "#0d1f14",
    primaryHover: "#98d6ac",
    primarySoft: "#1e3126",
    onPrimarySoft: "#c3e7cd",
    accent: "#b6a8d8",
    onAccent: "#1a1527",
    line: "#26332b",
    lineStrong: "#6c867a",
    danger: "#e79a90",
    onDanger: "#2a110e",
    focus: "#b6a8d8",
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
