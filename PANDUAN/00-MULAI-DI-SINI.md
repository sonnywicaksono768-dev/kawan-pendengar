# Panduan Kawan Pendengar

Diperiksa pada 10 November 2026. Mulai membaca dari file ini.

Status terakhir: halaman publik aktif di Vercel dengan palet hijau dan tata letak responsif terbaru. Balasan AI hanya tersedia selama 9Router dan tunnel di laptop menyala. Kalau balasan gagal, ikuti [05 - Maintenance dan masalah](05-MAINTENANCE-DAN-MASALAH.md).

## Apakah sudah final?

**Fitur utama sudah layak untuk uji coba terbatas, tetapi belum saya sebut layanan produksi 24 jam yang selesai sepenuhnya.** Web dan AI pernah diuji langsung. UI lokal telah diperiksa pada layar kecil sampai desktop, termasuk tema terang dan gelap. Namun, ada pekerjaan operasional sebelum rilis luas:

1. **UI terbaru sudah dipublikasikan.** Warna hijau pastel dan perbaikan responsif sudah masuk deployment Vercel pada 10 November 2026.
2. **Hilangkan ketergantungan pada laptop jika ingin aktif 24 jam.** Saat ini AI bergantung pada 9Router dan tunnel di laptop. Laptop tidur/mati atau koneksi putus dapat menghentikan balasan.
3. **Tinjau privasi dan keselamatan sebelum rilis luas.** Halaman privasi masih menyatakan kebijakannya sebagai draf. Tes teknis bukan penilaian klinis atau jaminan jawaban selalu aman.
4. **Periksa pembatasan akses dan pemakaian.** Kode mendukung Upstash Redis, tetapi tanpa konfigurasi yang berfungsi pembatasannya hanya tersimpan sementara pada proses server.

Tidak ada deploy, perubahan provider, atau perubahan konfigurasi yang dilakukan hanya karena panduan ini dibuat.

## Buka panduan yang sesuai kebutuhan

| Saya ingin... | Buka |
|---|---|
| Menyalakan lagi setelah laptop mati | [01 - Menyalakan dan mematikan](01-MENYALAKAN-DAN-MEMATIKAN.md) |
| Memahami cara memakai web | [02 - Cara menggunakan](02-CARA-MENGGUNAKAN.md) |
| Mengganti warna, tulisan, tata letak, atau perilaku AI | [03 - Mengubah UI dan AI](03-MENGUBAH-UI-DAN-AI.md) |
| Menampilkan perubahan lokal di link publik | [04 - Deploy ke Vercel](04-DEPLOY-KE-VERCEL.md) |
| Melakukan backup atau mengatasi error | [05 - Maintenance dan masalah](05-MAINTENANCE-DAN-MASALAH.md) |

Buka folder proyek menggunakan Qoder. File `.md` ini bisa dibaca sebagai teks atau lewat pratinjau Markdown; tidak perlu menjalankan web untuk membacanya.

## Lokasi dan alamat penting

| Keperluan | Lokasi/alamat |
|---|---|
| Folder sumber proyek di laptop pemilik | `C:\laragon\www\Psikolog\kawan-pendengar` |
| Folder panduan | `C:\laragon\www\Psikolog\kawan-pendengar\PANDUAN` |
| Website publik | https://kawan-pendengar.vercel.app |
| Web lokal saat memakai perintah dalam panduan | http://127.0.0.1:3000 |
| Dashboard 9Router di laptop pemilik | http://localhost:20128 |
| Repository sumber | https://github.com/sonnywicaksono768-dev/kawan-pendengar |

Alamat 9Router adalah dashboard pengelola, bukan link untuk dibagikan kepada pengguna. `localhost` berarti komputer yang sedang membuka alamat tersebut, bukan server Vercel dan bukan laptop pemilik ketika dibuka dari HP lain.

## Cara cepat di Windows

Jika Node.js sudah terpasang, buka folder proyek lalu klik dua kali `setup.bat`. Skrip akan memasang dependensi, membuat `.env.local` mode demo bila belum ada, menjalankan web di `http://127.0.0.1:3000`, dan membuka browser.

Skrip tidak menyalakan 9Router atau tunnel. Untuk AI nyata, ikuti langkah di [01 - Menyalakan dan mematikan](01-MENYALAKAN-DAN-MEMATIKAN.md).

## Cara kerja, tanpa istilah rumit

```text
Pengguna membuka website
          |
          v
Vercel menjalankan website dan API
          |
          v
Tunnel Cloudflare menghubungkan Vercel ke laptop
          |
          v
9Router di laptop memilih jalur ke penyedia AI
          |
          v
Penyedia model mengirimkan jawaban
```

Vercel menyimpan dan menjalankan versi web yang sudah dipublikasikan. **Vercel tidak otomatis menjalankan 9Router di laptop.** GitHub menyimpan versi kode, bukan mesin yang membuat balasan AI.

### Yang perlu menyala

| Keperluan | Laptop dan internet | 9Router | Tunnel | Server web lokal |
|---|---|---|---|---|
| Pengguna mendapat balasan AI lewat Vercel, dengan jalur saat ini | Ya | Ya | Ya | Tidak |
| Mengerjakan UI lokal tanpa AI | Ya | Tidak | Tidak | Ya |
| Menguji AI lokal dengan alamat router lokal | Ya | Ya | Tidak | Ya |

Jika laptop dimatikan, halaman yang sudah ada di Vercel umumnya masih dapat dibuka, tetapi balasan AI melalui laptop tidak berfungsi. Jalur cadangan langsung hanya membantu bila memang dikonfigurasi dan berhasil; keberadaannya tidak boleh diasumsikan.

**Tidak perlu menyalakan Apache, MySQL, atau tombol Start All di Laragon untuk aplikasi ini.** Foldernya memang ada di Laragon, tetapi aplikasi memakai Next.js/Node.js, bukan PHP.

## Aturan paling penting

- Jangan membagikan atau mengunggah `.env.local`, API key, token akun, maupun database konfigurasi 9Router.
- Jangan menghapus file untuk mengatasi error tanpa mengetahui fungsinya.
- Mengedit file lokal belum mengubah website publik. Perubahan environment Vercel juga membutuhkan deployment baru.
- Jangan mematikan filter keselamatan atau menghilangkan akses bantuan darurat hanya untuk membuat tes lulus.
- Gunakan data uji, bukan curhat pribadi pengguna, saat memeriksa model atau membuat screenshot.

Panduan ini mengikuti kode dan instalasi pada tanggal di atas. README dan panduan deploy lama di root proyek masih dapat berisi catatan historis. Untuk langkah operasional saat ini, mulai dari folder PANDUAN; jika struktur atau instalasi berubah, perbarui panduan ini juga.
