import { ALLOWED_NUMBERS } from "@/data/hotlines";

export type GuardViolation =
  | "diagnosis"
  | "medication"
  | "promise"
  | "foreign_number"
  | "prompt_leak"
  | "impersonation";

export type GuardResult = {
  ok: boolean;
  violations: GuardViolation[];
};

const DIAGNOSIS_PATTERNS: RegExp[] = [
  /kamu (pasti |jelas )?(menderita|mengidap|terkena)\s+(depresi|gangguan|bipolar|skizofrenia|anxiety|ptsd)/i,
  /diagnosis(kamu| kamu)?\s+(adalah|yaitu)/i,
  /kamu pasti (depresi|bipolar|mengidap)/i,
  /(menurutku|menurut aku) kamu (depresi|bipolar|gangguan jiwa)/i,
];

const MEDICATION_PATTERNS: RegExp[] = [
  /\b(ssri|snri|antidepresan|antipsikotik|benzodiazepin|xanax|diazepam|alprazolam|sertralin|fluoksetin|prozac|zoloft|ritalin|haloperidol|quetiapine|seroquel|olanzapine)\b/i,
  /\b\d+(\.\d+)?\s?(mg|ml|mcg|gram)\b/i,
  /(minum|makan|konsumsi)\s+(obat|pil|kapsul)\s+\w+/i,
];

const PROMISE_PATTERNS: RegExp[] = [
  /pasti (sembuh|membaik|baik|sembuh total)/i,
  /(dijamin|jaminan|jamin)\s+(kamu\s+)?(sembuh|membaik|berhasil)/i,
  /aku (bisa|akan) menyembuhkanmu/i,
  /tidak akan (pernah )?(kambuh|sedih) lagi/i,
];

const PROMPT_LEAK_PATTERNS: RegExp[] = [
  /ATURAN KEJUJURAN/i,
  /KETAHANAN TERHADAP MANIPULASI/i,
  /system prompt/i,
  /instruksi (sistem|awal)ku/i,
];

const IMPERSONATION_PATTERNS: RegExp[] = [
  /\bsebagai (psikolog|psikiater|dokter|terapis|konselor)\b/i,
  /\bsaya (adalah )?(dokter|psikolog|psikiater|terapis)\b/i,
  /\baku (adalah )?(dokter|psikolog|psikiater|terapis)\b/i,
  /\bseorang (psikolog|psikiater|dokter)\b/i,
];

const FOREIGN_NUMBER_PATTERN = /(\+?\d[\d\s().-]{6,}\d)/g;

function stripDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Rejects any phone-like number that is not one of the approved hotlines. A
 * three digit code such as 119, 112, or 129 stays allowed; anything else with
 * eight or more digits is treated as invented contact information.
 */
function hasForeignNumber(text: string): boolean {
  const candidates = text.match(FOREIGN_NUMBER_PATTERN) ?? [];
  for (const candidate of candidates) {
    const digits = stripDigits(candidate);
    if (digits.length < 8) continue;
    const allowed = ALLOWED_NUMBERS.some(
      (number) => digits === number || digits.startsWith(`62${number}`) || digits.startsWith(`0${number}`),
    );
    if (!allowed) return true;
  }

  if (/\b(911|999|000)\b/.test(text)) {
    return !ALLOWED_NUMBERS.includes("911");
  }

  return false;
}

export function checkOutput(text: string): GuardResult {
  const violations: GuardViolation[] = [];

  if (DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(text))) violations.push("diagnosis");
  if (MEDICATION_PATTERNS.some((pattern) => pattern.test(text))) violations.push("medication");
  if (PROMISE_PATTERNS.some((pattern) => pattern.test(text))) violations.push("promise");
  if (hasForeignNumber(text)) violations.push("foreign_number");
  if (PROMPT_LEAK_PATTERNS.some((pattern) => pattern.test(text))) violations.push("prompt_leak");
  if (IMPERSONATION_PATTERNS.some((pattern) => pattern.test(text))) violations.push("impersonation");

  return { ok: violations.length === 0, violations };
}

/** Aggregate counters only. No message content is ever stored or logged. */
const counters = new Map<GuardViolation, number>();

export function recordViolations(violations: GuardViolation[]): void {
  for (const violation of violations) {
    counters.set(violation, (counters.get(violation) ?? 0) + 1);
  }
}

export function guardCounters(): Record<string, number> {
  return Object.fromEntries(counters);
}
