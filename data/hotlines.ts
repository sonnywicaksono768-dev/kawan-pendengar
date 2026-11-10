export type Hotline = {
  id: string;
  label: string;
  number: string;
  ext?: string;
  phone: string;
  description: string;
};

/**
 * Single source of truth for every emergency number in the product.
 * Used by the SOS modal, the crisis response and the output guard allowlist.
 * Numbers verified against the Ministry of Health and Kemen PPPA pages in 2026.
 * Re-check before release and on a schedule after that (blueprint 9.5, 22.2).
 */
export const HOTLINES: Hotline[] = [
  {
    id: "mental-health",
    label: "Layanan Kesehatan Jiwa (Kemenkes)",
    number: "119",
    ext: "8",
    phone: "119",
    description: "Tekan 119, lalu pilih ekstensi 8. Layanan konseling krisis kesehatan jiwa.",
  },
  {
    id: "emergency",
    label: "Darurat Umum",
    number: "112",
    phone: "112",
    description: "Nomor darurat nasional untuk keadaan yang mengancam nyawa.",
  },
  {
    id: "child-women",
    label: "SAPA 129 (Perempuan dan Anak)",
    number: "129",
    phone: "129",
    description: "Layanan pengaduan kekerasan terhadap perempuan dan anak.",
  },
];

/** Every number the AI is allowed to mention. Rendered by the system, never by the model. */
export const ALLOWED_NUMBERS = HOTLINES.map((hotline) => hotline.number);

export function hotlineLabel(hotline: Hotline): string {
  return hotline.ext ? `${hotline.number} ext. ${hotline.ext}` : hotline.number;
}
