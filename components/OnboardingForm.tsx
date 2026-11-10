"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { saveProfile } from "@/lib/session";

type AgeGroup = "under18" | "adult";

export function OnboardingForm() {
  const router = useRouter();
  const nicknameId = useId();
  const ageLegendId = useId();
  const consentId = useId();

  const [nickname, setNickname] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = nickname.trim().replace(/\s+/g, " ");

    if (clean.length < 2) {
      setError("Tulis nama samaran minimal 2 huruf, ya. Ini tidak harus nama aslimu.");
      return;
    }
    if (clean.length > 24) {
      setError("Nama samaran maksimal 24 huruf. Coba yang lebih singkat.");
      return;
    }
    if (!ageGroup) {
      setError("Pilih kelompok usiamu dulu supaya aku bisa menyesuaikan bahasanya.");
      return;
    }
    if (!consent) {
      setError("Centang persetujuan dulu sebelum mulai, ya.");
      return;
    }

    setError(null);
    setSubmitting(true);
    saveProfile({
      nickname: clean,
      ageGroup,
      consentAt: new Date().toISOString(),
    });
    router.push("/chat");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="disclaimer">
        <ul>
          <li>Aku adalah AI, bukan manusia, psikolog, atau dokter. Aku tidak bisa mendiagnosis atau memberi obat.</li>
          <li>Aku bisa menemanimu bercerita dan merefleksikan perasaan, tapi bukan pengganti bantuan profesional.</li>
          <li>
            Kami tidak menyimpan percakapanmu, tetapi pesanmu diproses penyedia AI pihak ketiga.
            Jangan menuliskan data yang sangat pribadi.
          </li>
          <li>
            Kalau kamu dalam bahaya atau ingin menyakiti diri, hubungi bantuan darurat lewat tombol
            Bantuan Darurat.
          </li>
        </ul>
      </div>

      {error && (
        <div className="form-error" role="alert" style={{ marginBlockStart: "1rem" }}>
          <Icon name="alert" />
          <span>{error}</span>
        </div>
      )}

      <div className="field" style={{ marginBlockStart: "1.25rem" }}>
        <label htmlFor={nicknameId}>Nama samaran</label>
        <input
          id={nicknameId}
          className="input"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="misalnya: langit"
          maxLength={24}
          autoComplete="off"
          aria-describedby={`${nicknameId}-hint`}
          required
        />
        <span className="field-hint" id={`${nicknameId}-hint`}>
          Cukup nama panggilan. Jangan tulis nama lengkap atau data pribadi.
        </span>
      </div>

      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend className="field-label" id={ageLegendId} style={{ marginBlockEnd: "0.5rem" }}>
          Usia
        </legend>
        <div className="choice-list" role="radiogroup" aria-labelledby={ageLegendId}>
          <label className="choice">
            <input
              type="radio"
              name="age-group"
              value="adult"
              checked={ageGroup === "adult"}
              onChange={() => setAgeGroup("adult")}
            />
            <span>
              <strong>18 tahun ke atas</strong>
              <small>Bisa memakai seluruh mode yang tersedia.</small>
            </span>
          </label>
          <label className="choice">
            <input
              type="radio"
              name="age-group"
              value="under18"
              checked={ageGroup === "under18"}
              onChange={() => setAgeGroup("under18")}
            />
            <span>
              <strong>Di bawah 18 tahun</strong>
              <small>Aku akan memakai bahasa yang lebih ramah untuk pelajar.</small>
            </span>
          </label>
        </div>
      </fieldset>

      {ageGroup === "under18" && (
        <div className="notice" role="note">
          Kalau kamu masih di bawah 18, cerita ini mungkin lebih aman dibicarakan juga dengan orang
          dewasa yang kamu percaya, seperti orang tua, wali, atau guru BK. Untuk kasus kekerasan,
          SAPA 129 bisa dihubungi. Selengkapnya di halaman <a href="/bantuan">Bantuan</a>.
        </div>
      )}

      <label className="choice" htmlFor={consentId} style={{ marginBlockEnd: "1.25rem" }}>
        <input
          id={consentId}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>
          <strong>Aku sudah membaca dan setuju dengan penjelasan di atas.</strong>
          <small>Persetujuan ini hanya tersimpan di tab ini, tidak dikirim ke server.</small>
        </span>
      </label>

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Membuka ruang obrolan..." : "Mulai ngobrol"}
      </button>
    </form>
  );
}
