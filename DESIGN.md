# Arah desain: Kawan Pendengar

Dokumen ini mencatat arah visual yang dipakai saat membangun. Sumber arahan: `../blueprint-arsitektur-sistem.md` bagian 8.6 dan prinsip bagian 3.

## Design Read

Reading this as: healthcare companion for Indonesian first-time users, warm and quiet visual language, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

- **Domain:** kesehatan mental dan refleksi diri, konsumen.
- **Audiens dan nada:** pengguna umum, banyak yang pertama kali memakai layanan seperti ini, mungkin sedang rapuh. Tenang, tidak klinis, tidak meriah.
- **Mood yang harus didapat:** "teduh". Bukan "fun", bukan "premium".
- **Kedalaman gerak:** umpan balik halus saja.
- **Keluarga layout:** hero asimetris 7/5 untuk onboarding, lalu daftar indeks bertipe editorial, lalu blok batas dan keselamatan. Halaman chat memakai satu kolom terukur dengan composer tetap di bawah.
- **Anchor referensi:** situs layanan publik yang tenang, bukan produk SaaS gelap.

## Keputusan dan alasannya (satu baris)

- **Warna primer teal gelap `#1d5c57`:** menenangkan dan tidak dipakai sebagai gradasi biru ke ungu yang generik; rasio 7.39:1 untuk teks tombol.
- **Latar hangat `#fbfaf7`, bukan putih murni:** mengurangi kesan dingin dan klinis pada layar yang dibaca lama.
- **Lavender `#6a5d8b` hanya sebagai aksen:** muncul di garis motif, fokus, dan tab aktif, tidak di seluruh permukaan.
- **Fraunces untuk display, Plus Jakarta Sans untuk UI:** suara manusia untuk kalimat pembuka, huruf UI yang dirancang untuk bahasa Indonesia untuk teks kerja.
- **Judul display minimal 2.5x ukuran body:** hierarki terlihat, bukan sekadar body yang ditebalkan.
- **Garis napas (satu garis panjang dan satu pendek):** motif identitas yang tenang, muncul hanya di atas judul bagian.
- **Radius 14px kartu dan 10px kontrol:** konsisten, tidak membuat semua elemen berbentuk pil.
- **Tanpa bayangan di setiap kotak:** bayangan hanya pada panel onboarding dan dialog, untuk elevasi nyata.
- **Tanpa ilustrasi dan tanpa avatar:** tidak ada aset yang dikarang. Wordmark berupa teks.
- **Dua tema penuh:** terang dan gelap, keduanya diukur lewat `scripts/check-contrast.mjs`.

## Yang sengaja tidak dipakai

Gradasi penuh halaman, glow, glassmorphism, grid latar, kartu fitur identik, badge kapsul di atas judul, ikon sparkle, emoji, dan em dash.

## Gerbang

- `node scripts/check-contrast.mjs` mengukur seluruh pasangan teks dan kontrol di kedua tema.
- `npm run test:scenarios` memeriksa lapis krisis, validasi payload, dan output guard.
- `npm run build` memastikan aplikasi benar-benar dapat dibangun.
