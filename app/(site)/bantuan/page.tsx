import type { Metadata } from "next";
import Link from "next/link";
import { HOTLINES, hotlineLabel } from "@/data/hotlines";
import { SosButton } from "@/components/SosButton";

export const metadata: Metadata = {
  title: "Bantuan darurat",
  description: "Nomor layanan darurat dan langkah awal saat kamu merasa tidak aman.",
};

export default function BantuanPage() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="page-header">
          <span className="breath" aria-hidden="true">
            <span />
            <span />
          </span>
          <h1>Bantuan darurat dan layanan nyata</h1>
          <p>
            Kalau kamu merasa tidak aman, hubungi salah satu nomor di bawah sekarang. Kamu tidak
            perlu menjelaskan panjang, cukup bilang kamu butuh bantuan.
          </p>
        </div>

        <div style={{ marginBlockStart: "1.5rem" }}>
          <SosButton />
        </div>

        <ul className="hotline-list" style={{ maxWidth: "34rem" }}>
          {HOTLINES.map((hotline) => (
            <li className="hotline" key={hotline.id}>
              <span className="hotline-label">{hotline.label}</span>
              <a className="hotline-number" href={`tel:${hotline.phone}`}>
                {hotlineLabel(hotline)}
              </a>
              <p>{hotline.description}</p>
            </li>
          ))}
        </ul>

        <div className="prose">
          <h2>Saat menunggu bantuan</h2>
          <ul>
            <li>Kalau bahaya sedang terjadi, datang ke IGD rumah sakit terdekat.</li>
            <li>Kabari satu orang yang kamu percaya dan minta dia menemani, walau lewat pesan.</li>
            <li>Jauhkan benda yang bisa membahayakanmu, kalau itu memungkinkan.</li>
            <li>Tarik dan buang napas perlahan. Tidak perlu memaksa diri untuk tenang sekaligus.</li>
          </ul>

          <h2>Latihan menenangkan tanpa AI</h2>
          <p>
            Dua latihan ini berjalan di perangkatmu dan tidak membutuhkan koneksi ke AI. Kamu bisa
            memakainya kapan saja.
          </p>

          <h3>Grounding 5-4-3-2-1</h3>
          <ul>
            <li>Sebutkan 5 hal yang bisa kamu lihat.</li>
            <li>Sebutkan 4 hal yang bisa kamu sentuh.</li>
            <li>Sebutkan 3 suara yang bisa kamu dengar.</li>
            <li>Sebutkan 2 bau yang bisa kamu cium.</li>
            <li>Sebutkan 1 rasa di mulutmu.</li>
          </ul>
          <p>
            Versi bertahap dengan panduan per langkah ada di{" "}
            <Link href="/chat?mode=grounding">ruang latihan</Link>.
          </p>

          <h3>Pernapasan kotak 4-4-4-4</h3>
          <p>
            Tarik napas 4 hitungan, tahan 4 hitungan, buang napas 4 hitungan, tahan 4 hitungan.
            Ulangi 4 kali. Kalau menahan napas terasa tidak nyaman, cukup tarik dan buang napas
            perlahan tanpa menahan.
          </p>

          <h2>Mencari bantuan jangka panjang</h2>
          <p>
            Untuk keluhan yang sudah berlangsung lama atau mengganggu tidur, makan, sekolah, atau
            kerja, bantuan profesional bisa membantu. Beberapa pintu masuk yang umum:
          </p>
          <ul>
            <li>Puskesmas terdekat, untuk layanan kesehatan jiwa dasar.</li>
            <li>Layanan konseling kampus, kalau kamu mahasiswa.</li>
            <li>Psikolog klinis atau psikiater, untuk asesmen dan pendampingan.</li>
            <li>IGD rumah sakit, kalau kamu merasa tidak aman saat ini.</li>
          </ul>
          <p>
            Ketersediaan layanan dan biaya bisa berbeda di tiap daerah. Tanyakan langsung saat
            menghubungi, supaya kamu tahu apa yang bisa diakses.
          </p>

          <h2>Kalau kamu ingin menemani orang lain</h2>
          <ul>
            <li>Dengarkan tanpa langsung menasihati. Kehadiranmu sudah berarti.</li>
            <li>Tanyakan apakah dia sedang merasa aman, dan apakah ada yang bisa kamu bantu sekarang.</li>
            <li>Bantu dia menghubungi layanan yang sesuai, jangan mengurus semuanya sendiri.</li>
            <li>Kalau bahaya sedang terjadi, jangan tinggalkan dia sendiri. Hubungi 112.</li>
          </ul>

          <div className="notice">
            Halaman ini statis dan tetap bisa dibuka walau layanan AI sedang bermasalah. Nomor
            kontak disimpan di satu berkas konfigurasi dan perlu diperiksa ulang secara berkala.
          </div>
        </div>
      </div>
    </div>
  );
}
