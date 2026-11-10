import { ALLOWED_NUMBERS, HOTLINES, hotlineLabel } from "@/data/hotlines";

export type RiskLevel = "SAFE" | "RISK" | "CRISIS";
export type RiskKind = "self" | "violence" | "others" | null;

export type RiskAssessment = {
  level: RiskLevel;
  kind: RiskKind;
};

/**
 * Slang and repeat normalisation so "matiiii", "gak", "ngga", and "gw" match.
 * This list is a starting point and must be extended with a psychologist.
 */
const SLANG: Array<[RegExp, string]> = [
  [/\b(ga|gak|nggak|ngga|enggak|engga|tdk|tak)\b/g, "tidak"],
  [/\b(gw|gue|gua)\b/g, "aku"],
  [/\b(bgt|bngt|banget2)\b/g, "banget"],
  [/\bmo\b/g, "mau"],
  [/\budah\b/g, "sudah"],
  [/\blg\b/g, "lagi"],
  [/\bpingin\b/g, "pengen"],
  [/\bnyilet\b/g, "nyilet"],
  [/\bself\s?harm\b/g, "selfharm"],
];

/** Idioms that contain crisis words but describe everyday situations. */
const IDIOM_EXCLUSIONS: RegExp[] = [
  /mati lampu/g,
  /mati gaya/g,
  /mati ketawa/g,
  /mati kutu/g,
  /mati listrik/g,
  /mati mesin/g,
  /mati muda/g,
  /bunuh waktu/g,
  /bunuh kebosanan/g,
  /gantung baju/g,
  /gantung poto/g,
  /gantung foto/g,
];

/** Direct statements of intent or method. */
const EXPLICIT_PATTERNS: RegExp[] = [
  /bunuh diri/,
  /(akhiri|mengakhiri|udahan|sudahi)\s+(hidup|semuanya)/,
  /gantung diri/,
  /loncat dari/,
  /lompat dari/,
  /overdosis|overdose/,
  /nyilet|menyayat|sayat (tangan|tubuh)/,
  /selfharm|self harm/,
  /(minum|makan) (racun|obat) (banyak|semua)/,
  /pengen (mati|meninggal) (aja|saja|sekarang)/,
  /mau mati (aja|saja)/,
  /ingin mati/,
];

/** Softer signals that need care, not necessarily an emergency. */
const IMPLICIT_PATTERNS: RegExp[] = [
  /(pengen|ingin|mau)\s+(ngilang|menghilang|hilang)( aja| saja)?/,
  /capek hidup|capek sama hidup|lelah hidup/,
  /tidak (mau|ingin|pengen) bangun (lagi|besok)/,
  /lebih baik (tanpa aku|aku pergi|aku tidak ada|aku mati)/,
  /tidak ada gunanya (hidup|aku)/,
  /pamit ya|pamitan/,
  /pengen (tidur|istirahat) (selamanya|terus)/,
  /tidak kuat (lagi|hidup)/,
  /sudah tidak sanggup (lagi|hidup)/,
  /mending aku (mati|hilang)/,
  /pengen (meninggal|mati)/,
  /mati (aja|saja)/,
];

/** Violence and abuse, whether the user is a target or a witness. */
const VIOLENCE_PATTERNS: RegExp[] = [
  /kdrt|kekerasan dalam rumah tangga/,
  /dipukul|dilecehkan|disiksa|dianiaya/,
  /pelecehan|diganggu secara seksual/,
  /diancam|diteror/,
  /(ayah|ibu|kakak|adik|pacar|suami|istri|guru|dosen|atasan) (memukul|menyiksa|melecehkan)/,
];

/** Intent to harm someone else. */
const HARM_OTHERS_PATTERNS: RegExp[] = [
  /(pengen|ingin|mau)\s+(nyakitin|menyakiti|membunuh|bunuh|melukai)\s+(dia|orang|mereka)/,
  /(pengen|ingin|mau)\s+(balas|membalas)\s+dendam/,
  /bawa (pisau|senjata)/,
];

export function normalize(text: string): string {
  let value = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘`]/g, "'");

  for (const [pattern, replacement] of SLANG) {
    value = value.replace(pattern, replacement);
  }

  return value
    .replace(/(.)\1{2,}/g, "$1")
    .replace(/[^\p{L}\p{N}\s'.:/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripIdioms(text: string): string {
  return IDIOM_EXCLUSIONS.reduce((value, pattern) => value.replace(pattern, " "), text);
}

/**
 * Layer 1. Reads several recent user messages, not only the last one, so a
 * gradual signal is still caught (blueprint 9.3).
 */
export function keywordRisk(recentUserMessages: string[]): RiskAssessment {
  const joined = recentUserMessages.slice(-5).join(" . ");
  const text = stripIdioms(normalize(joined));

  if (HARM_OTHERS_PATTERNS.some((pattern) => pattern.test(text))) {
    return { level: "CRISIS", kind: "others" };
  }
  if (VIOLENCE_PATTERNS.some((pattern) => pattern.test(text))) {
    return { level: "CRISIS", kind: "violence" };
  }
  if (EXPLICIT_PATTERNS.some((pattern) => pattern.test(text))) {
    return { level: "CRISIS", kind: "self" };
  }
  if (IMPLICIT_PATTERNS.some((pattern) => pattern.test(text))) {
    return { level: "RISK", kind: "self" };
  }
  return { level: "SAFE", kind: null };
}

/** Every hotline the crisis response renders, from configuration only. */
export function hotlineListForResponse() {
  return HOTLINES.map((hotline) => ({
    id: hotline.id,
    label: hotline.label,
    number: hotline.number,
    ext: hotline.ext ?? null,
    display: hotlineLabel(hotline),
    description: hotline.description,
  }));
}

const SELF_CRISIS_RESPONSE = `Terima kasih sudah mau cerita. Aku tahu itu tidak mudah, dan yang kamu rasakan terdengar sangat berat. Aku peduli sama keselamatanmu, dan kamu tidak harus menghadapi ini sendirian.

Tolong hubungi bantuan sekarang: 119 ext. 8 untuk layanan kesehatan jiwa, atau 112 kalau kamu merasa tidak aman saat ini. Kalau ada orang terdekat, kabari dia dan minta ditemani. Kalau kamu merasa dalam bahaya, datang ke IGD rumah sakit terdekat.

Aku tetap di sini kalau kamu mau lanjut cerita, pelan-pelan saja.`;

const VIOLENCE_RESPONSE = `Terima kasih sudah mempercayai aku dengan cerita ini. Apa yang kamu alami tidak seharusnya terjadi, dan itu bukan salahmu. Keselamatanmu yang paling penting sekarang.

Kalau kamu sedang tidak aman, hubungi 112 atau datang ke tempat yang ada orang lain di dekatmu. Untuk pendampingan kekerasan terhadap perempuan dan anak, hubungi SAPA 129.

Kamu tidak perlu menceritakan semuanya sekarang. Kalau mau, kita bisa memikirkan satu langkah kecil yang membuatmu merasa lebih aman hari ini.`;

const OTHERS_RESPONSE = `Aku mendengar kemarahan dan dorongan yang berat itu, dan aku senang kamu mau mengatakannya di sini, bukan langsung dilakukan. Perasaan seperti ini bisa terasa sangat kuat sampai sulit dipikirkan dengan jernih.

Sebaiknya kamu menjauh dari situasi itu dulu dan bicara dengan orang yang bisa dipercaya. Kalau dorongan itu sulit ditahan, hubungi 119 ext. 8 atau 112 supaya kamu tidak sendirian menghadapinya.

Kalau mau, kita bisa membahas apa yang membuat situasinya terasa seberat ini, tanpa menghakimi.`;

export function crisisResponse(kind: RiskKind): string {
  if (kind === "violence") return VIOLENCE_RESPONSE;
  if (kind === "others") return OTHERS_RESPONSE;
  return SELF_CRISIS_RESPONSE;
}

/** Used by the output guard to keep every allowed number intact. */
export const allowedNumberList = ALLOWED_NUMBERS;
