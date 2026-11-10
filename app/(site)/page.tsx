import Link from "next/link";
import { OnboardingForm } from "@/components/OnboardingForm";
import { SosButton } from "@/components/SosButton";

const MODES = [
  {
    title: "Obrolan bebas",
    body: "Curhat tanpa arah tertentu. Aku mendengarkan, memvalidasi, dan membantu kamu melihat apa yang sedang terjadi.",
    href: "/chat?mode=free_chat",
    action: "Mulai obrolan bebas",
  },
  {
    title: "Check-in suasana hati",
    body: "Menamai emosi, menelusuri pemicunya, dan menilai seberapa kuat rasanya saat ini.",
    href: "/chat?mode=mood_checkin",
    action: "Mulai check-in",
  },
  {
    title: "Catatan pikiran",
    body: "Menulis situasi, pikiran otomatis, dan bukti di sekitarnya, lalu menyusun pikiran yang lebih seimbang.",
    href: "/chat?mode=thought_record",
    action: "Mulai catatan pikiran",
  },
  {
    title: "Nilai dan arah",
    body: "Mencari hal yang membuatmu merasa hidup, lalu satu langkah kecil yang sejalan dengan itu.",
    href: "/chat?mode=values_explore",
    action: "Mulai eksplorasi nilai",
  },
  {
    title: "Latihan menenangkan",
    body: "Panduan 5-4-3-2-1 dan pernapasan kotak. Berjalan di perangkatmu, tanpa AI dan tanpa kuota.",
    href: "/chat?mode=grounding",
    action: "Buka latihan",
  },
  {
    title: "Ringkasan sesi",
    body: "Merangkum emosi, pola, dan langkah kecil dari obrolanmu, untuk kamu simpan sendiri.",
    href: "/chat?mode=summary",
    action: "Lihat ringkasan",
  },
];

const LIMITS = [
  {
    term: "Tidak mendiagnosis",
    detail:
      "Hanya psikolog atau psikiater yang bisa menegakkan diagnosis. Aku bisa menjelaskan istilah umum, bukan menilai kondisimu.",
  },
  {
    term: "Tidak menyarankan obat",
    detail:
      "Pertanyaan soal obat, dosis, atau terapi medis akan kuarahkan ke dokter atau psikiater.",
  },
  {
    term: "Bukan layanan darurat",
    detail:
      "Kalau kamu dalam bahaya, hubungi 112, 119 ext. 8, atau IGD terdekat. Jangan menunggu balasan dariku.",
  },
  {
    term: "Pesan diproses pihak ketiga",
    detail:
      "Percakapan tidak disimpan di server kami, tetapi diproses penyedia AI. Hindari nama lengkap, alamat, dan nomor telepon.",
  },
  {
    term: "Bisa keliru",
    detail:
      "Aku AI dan bisa salah menangkap ceritamu. Kalau ada yang terasa tidak pas, percayai penilaianmu dan bicara dengan profesional.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="breath" aria-hidden="true">
              <span />
              <span />
            </span>
            <h1>Tempat bercerita yang mendengarkan tanpa menghakimi.</h1>
            <p className="lede">
              Kawan Pendengar menemani kamu menamai perasaan, melihat pola pikirmu, dan menemukan
              satu langkah kecil. Dia AI, bukan psikolog, dan tidak menggantikan bantuan
              profesional.
            </p>

            <a className="btn btn-primary hero-cta" href="#mulai">
              Isi nama samaran
            </a>

            <ul className="hero-points">
              <li>
                <strong>Boleh mulai dari yang paling sederhana</strong>
                <span>Tulis satu kalimat tentang harimu. Tidak perlu rapi atau lengkap.</span>
              </li>
              <li>
                <strong>Kamu yang memegang ceritamu</strong>
                <span>
                  Riwayat hanya ada di tab ini dan hilang saat tab ditutup. Kami tidak menyimpannya
                  di server.
                </span>
              </li>
              <li>
                <strong>Bantuan nyata selalu satu ketukan</strong>
                <span>
                  Tombol Bantuan Darurat berisi nomor layanan yang bisa dihubungi kapan saja.
                </span>
              </li>
            </ul>
          </div>

          <aside className="hero-aside" id="mulai" aria-labelledby="mulai-judul">
            <h2 id="mulai-judul">Mulai dengan nama samaran</h2>
            <p>Tanpa email, tanpa kata sandi. Cukup nama yang ingin kamu pakai di sini.</p>
            <OnboardingForm />
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="cara-judul">
        <div className="wrap">
          <span className="breath" aria-hidden="true">
            <span />
            <span />
          </span>
          <h2 id="cara-judul">Enam cara menemani</h2>
          <p className="section-lede">
            Pilih yang paling dekat dengan kebutuhanmu hari ini. Semua mode tetap mengikuti aturan
            keselamatan yang sama.
          </p>

          <ul className="index-list">
            {MODES.map((mode) => (
              <li className="index-item" key={mode.title}>
                <h3>{mode.title}</h3>
                <p>{mode.body}</p>
                <Link className="btn btn-secondary btn-sm" href={mode.href}>
                  {mode.action}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="batas-judul">
        <div className="wrap">
          <span className="breath" aria-hidden="true">
            <span />
            <span />
          </span>
          <h2 id="batas-judul">Batas yang perlu kamu tahu sebelum mulai</h2>

          <div className="limits-grid">
            <dl className="limits-list">
              {LIMITS.map((limit) => (
                <div key={limit.term}>
                  <dt>{limit.term}</dt>
                  <dd>{limit.detail}</dd>
                </div>
              ))}
            </dl>

            <div className="safety-panel">
              <h3>Kalau kamu sedang dalam bahaya</h3>
              <p>
                Hubungi bantuan sekarang, jangan menunggu balasan dari AI. Kamu tidak perlu
                menjelaskan panjang di telepon.
              </p>
              <SosButton />
              <Link className="btn btn-secondary btn-block" href="/bantuan">
                Lihat semua kontak bantuan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
