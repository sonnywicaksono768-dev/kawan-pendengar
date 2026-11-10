import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privasi",
  description:
    "Data apa yang diproses Kawan Pendengar, siapa yang memprosesnya, dan apa yang tidak disimpan.",
};

export default function PrivasiPage() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="page-header">
          <span className="breath" aria-hidden="true">
            <span />
            <span />
          </span>
          <h1>Privasi dan batasan layanan</h1>
          <p>
            Halaman ini menjelaskan data apa yang diproses, siapa yang memprosesnya, dan apa yang
            tidak kami simpan. Kami tidak mengklaim privasi maksimal, karena pesanmu tetap dikirim
            ke penyedia AI pihak ketiga.
          </p>
        </div>

        <div className="prose">
          <h2>Yang tidak kami minta</h2>
          <ul>
            <li>Tidak ada akun, email, nomor telepon, atau kata sandi.</li>
            <li>Nama samaran hanya dipakai untuk menyapa kamu di layar.</li>
            <li>Tidak ada cookie pelacak dan tidak ada analytics pihak ketiga.</li>
          </ul>

          <h2>Yang diproses</h2>
          <ul>
            <li>
              Pesan yang kamu kirim dikirim ke server kami, lalu diteruskan ke penyedia model AI
              untuk dibuatkan balasan.
            </li>
            <li>
              Alamat IP dipakai untuk membatasi jumlah permintaan. IP di-hash dengan salt, dan IP
              mentah tidak disimpan.
            </li>
            <li>
              Isi percakapan tidak dicatat di log server. Yang dicatat hanya status teknis dan
              jumlah error.
            </li>
            <li>
              Umpan balik hanya berupa label membantu atau kurang pas, tanpa isi percakapan.
            </li>
          </ul>

          <h2>Penyedia AI pihak ketiga</h2>
          <p>
            Balasan dibuat oleh penyedia model AI di luar kendali kami, misalnya Google AI Studio,
            Groq, atau OpenRouter. Pada tier gratis, penyedia dapat menyimpan atau memakai data
            untuk peningkatan produk, dan sebagian model gratis dikelola pihak ketiga yang mencatat
            prompt. Karena itu jangan menuliskan nama lengkap, alamat, nomor telepon, nomor rekening,
            atau data sensitif lain.
          </p>

          <h2>Berapa lama data disimpan</h2>
          <ul>
            <li>
              Riwayat obrolan hanya ada di sessionStorage browser dan hilang saat tab ditutup.
            </li>
            <li>Server tidak menyimpan percakapan.</li>
            <li>
              Penghitung agregat, seperti jumlah umpan balik dan jumlah pelanggaran filter, tidak
              memuat isi percakapan dan hilang saat proses server dimulai ulang.
            </li>
          </ul>

          <h2>Hak dan kendali kamu</h2>
          <ul>
            <li>Tombol Akhiri sesi menghapus riwayat di tab ini.</li>
            <li>Menutup tab juga menghapus riwayat tersebut.</li>
            <li>Kamu bisa berhenti kapan saja tanpa perlu menjelaskan alasan.</li>
          </ul>

          <h2>Keamanan</h2>
          <ul>
            <li>Kunci API hanya disimpan di environment server, tidak pernah di browser atau repo.</li>
            <li>Koneksi memakai HTTPS.</li>
            <li>
              Header keamanan dasar dipasang, termasuk Content Security Policy dan larangan
              embedding halaman ini di situs lain.
            </li>
          </ul>

          <h2>Pengguna di bawah 18 tahun</h2>
          <p>
            Kalau kamu masih di bawah 18, sebaiknya cerita ini juga dibicarakan dengan orang dewasa
            yang kamu percaya. Untuk kasus kekerasan terhadap perempuan dan anak, hubungi SAPA 129.
            Lihat halaman <Link href="/bantuan">Bantuan</Link>.
          </p>

          <div className="notice">
            Data kesehatan mental termasuk data pribadi yang bersifat spesifik menurut UU
            Pelindungan Data Pribadi. Kebijakan ini adalah draf dan perlu ditinjau sebelum rilis
            luas. Lihat juga <Link href="/bantuan">halaman bantuan</Link> untuk layanan nyata yang
            bisa dihubungi.
          </div>
        </div>
      </div>
    </div>
  );
}
