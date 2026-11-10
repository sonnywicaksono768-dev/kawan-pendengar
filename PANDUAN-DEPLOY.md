# Panduan Rilis Kawan Pendengar

Status per 9 November 2026: aplikasi berjalan lokal di `http://localhost:3100` dengan provider demo. Belum ada repo git, belum ada deployment, dan belum ada kunci API produksi.

Panduan ini berurutan. Ikuti dari atas, jangan lompat ke Vercel sebelum bagian 3 lulus.

## 0. Ringkasan sepuluh langkah

1. Install dependensi dan jalankan mode demo.
2. Lakukan smoke test manual di browser.
3. Isi kunci API dan uji jalur AI sungguhan.
4. Jalankan kontras, skenario, dan build.
5. Buat repo git dan pastikan `.env.local` tidak ikut.
6. Push ke GitHub.
7. Import repo ke Vercel.
8. Isi environment variables, termasuk Upstash.
9. Deploy dan verifikasi `/api/health`, CSP, chat, krisis, SOS.
10. Baca daftar fitur yang belum berjalan di bagian 7 sebelum mengumumkan rilis.

## 1. Siapkan dari nol di komputer

Prasyarat: Node.js 18.18 atau lebih baru. Di mesin ini Node v24.21.0 dan npm 11.19.0.

```bash
cd C:\laragon\www\Psikolog\kawan-pendengar
npm install
cp .env.example .env.local
```

Buka `.env.local`, isi minimal:

```
LLM_DEMO=1
IP_HASH_SALT=isi-dengan-string-acak-panjang
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:3000`. Kalau port dipakai:

```bash
npm run dev -- --port 3100
```

### Smoke test manual

Lakukan berurutan, catat hasilnya:

- [ ] Isi nama samaran, pilih usia, centang persetujuan, klik "Mulai ngobrol".
- [ ] Kirim satu pesan biasa, balasan muncul.
- [ ] Klik "Membantu" dan "Kurang pas", pesan terima kasih muncul.
- [ ] Buka tab Check-in, Catatan pikiran, Nilai, Latihan, Ringkasan.
- [ ] Di Latihan, coba kedua latihan dan tombol "Lanjut".
- [ ] Di Ringkasan, klik "Buat ringkasan", lalu "Salin ringkasan" dan "Unduh ringkasan".
- [ ] Kirim pesan krisis, misalnya "aku mau bunuh diri", pastikan muncul 119 ext. 8, 112, dan 129.
- [ ] Buka modal Bantuan Darurat, tutup dengan Escape, fokus kembali ke tombol pemicu.
- [ ] Ganti tema terang dan gelap, lalu reload, pilihan tetap.
- [ ] Klik "Akhiri sesi", muncul konfirmasi, klik "Batal", sesi tetap ada.
- [ ] Buka `/bantuan` dan `/privasi` langsung tanpa lewat chat.
- [ ] Kecilkan jendela ke 390 px, pastikan tidak ada scroll horizontal.

## 2. Uji dengan AI sungguhan

Isi salah satu jalur di `.env.local`.

Jalur utama 9Router:

```
NINEROUTER_URL=https://alamat-router-tanpa-v1
NINEROUTER_API_KEY=...
LLM_MODEL=...
LLM_CLASSIFIER_MODEL=...
```

Jalur cadangan langsung, isi minimal satu:

```
FALLBACK_PROVIDERS=gemini,groq,openrouter
GEMINI_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
```

Lalu:

```
LLM_TIMEOUT_MS=20000
RATE_LIMIT_PER_MINUTE=20
RATE_LIMIT_PER_DAY=200
STREAMING_ENABLED=false
IP_HASH_SALT=string-acak-panjang
```

Setelah mengubah env, hentikan dev server dan jalankan ulang. Cek:

```bash
curl http://localhost:3000/api/health
```

`canGenerate: true` dan `provider` bukan `demo` berarti jalur AI siap.

Yang perlu dinilai manusia, bukan skrip:

- Apakah balasan terasa hangat dan tidak formulaik.
- Apakah pesan ambigu seperti "aku capek hidup" ditangani dengan tepat.
- Apakah model tidak pernah menyebut nomor telepon sendiri.
- Apakah ringkasan tidak mengandung diagnosis.

## 3. Pemeriksaan sebelum deploy

```bash
cd C:\laragon\www\Psikolog\kawan-pendengar
npm run check:contrast
npm run test:scenarios
npm run build
```

Semua harus exit 0. Jangan deploy kalau salah satu gagal.

Penting: `npm run build` saat `next dev` masih berjalan menimpa folder `.next` dan membuat halaman 500 dengan pesan `Cannot find module './897.js'`. Hentikan dev server dulu, atau restart dev setelah build.

## 4. Repo git dan GitHub

Folder `kawan-pendengar` belum berupa repo. Inisialisasi di dalam folder aplikasi, bukan di folder induk.

```bash
cd C:\laragon\www\Psikolog\kawan-pendengar
git init -b main
git add .
git status --short
```

Pastikan `.env.local` tidak muncul di daftar. Verifikasi:

```bash
git ls-files | grep -i env
```

Hasil yang benar hanya `.env.example`. Kalau `.env.local` ikut, keluarkan dulu:

```bash
git rm --cached .env.local
```

Commit dan push:

```bash
git commit -m "Kawan Pendengar: pendamping refleksi berbasis AI"
```

Buat repo kosong di GitHub tanpa README, tanpa gitignore, tanpa license. Lalu:

```bash
git remote add origin https://github.com/USERNAME/kawan-pendengar.git
git push -u origin main
```

Alternatif: push seluruh folder `Psikolog` sebagai satu repo, lalu di Vercel isi Root Directory `kawan-pendengar`. Repo jadi lebih besar karena membawa blueprint dan skill.

## 5. Deploy ke Vercel

1. Buka vercel.com, klik Add New, lalu Project.
2. Pilih Import Git Repository dan hubungkan GitHub.
3. Pilih repo `kawan-pendengar`.
4. Framework Preset terdeteksi Next.js. Biarkan Build Command `next build` dan Install Command `npm install`.
5. Kalau memakai repo induk, isi Root Directory `kawan-pendengar`.
6. Buka Environment Variables, isi untuk Production dan Preview.

| Variabel | Wajib | Catatan |
|---|---|---|
| `NINEROUTER_URL` | jika pakai 9Router | tanpa `/v1/chat/completions` |
| `NINEROUTER_API_KEY` | jika pakai 9Router | hanya server |
| `LLM_MODEL` | jika pakai 9Router | model utama |
| `LLM_CLASSIFIER_MODEL` | jika pakai 9Router | klasifikasi krisis lapis 2 |
| `FALLBACK_PROVIDERS` | opsional | `gemini,groq,openrouter` |
| `GEMINI_API_KEY` | jika pakai Gemini | salah satu jalur cadangan |
| `GROQ_API_KEY` | jika pakai Groq | salah satu jalur cadangan |
| `OPENROUTER_API_KEY` | jika pakai OpenRouter | salah satu jalur cadangan |
| `IP_HASH_SALT` | ya | string acak panjang, jangan pakai contoh |
| `LLM_TIMEOUT_MS` | opsional | default 20000 |
| `RATE_LIMIT_PER_MINUTE` | opsional | default 20 |
| `RATE_LIMIT_PER_DAY` | opsional | default 200 |
| `UPSTASH_REDIS_REST_URL` | sangat disarankan | rate limit lintas instance |
| `UPSTASH_REDIS_REST_TOKEN` | sangat disarankan | pasangan URL di atas |
| `STREAMING_ENABLED` | opsional | biarkan `false` |

Jangan mengisi `LLM_DEMO` di Vercel. Kode memblokir mode demo saat production, tetapi lebih aman tidak diisi.

### Rate limit di serverless

Tanpa Upstash, rate limit memakai Map in-memory. Di Vercel setiap instance punya memori sendiri, jadi batas per IP tidak konsisten. Untuk produksi:

1. Buka Storage atau Integrations di dashboard Vercel.
2. Tambahkan Upstash Redis dan hubungkan ke project.
3. Pastikan `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` tersedia.
4. Kalau integrasi hanya memberi `KV_REST_API_URL` dan `KV_REST_API_TOKEN`, salin nilainya ke dua nama `UPSTASH_` tadi.
5. Redeploy.

### Region dan biaya

Region fungsi bisa diatur mendekati Indonesia, misalnya Singapura, bila plan mengizinkan. Plan Hobby gratis dengan batas pemakaian bulanan. Biaya terbesar biasanya berasal dari provider AI, bukan Vercel, jadi jaga `RATE_LIMIT_PER_DAY` dan pantau pemakaian kunci.

## 6. Verifikasi setelah deploy

Ganti `PROJECT` dengan domain Vercel kamu.

```bash
curl -s https://PROJECT.vercel.app/api/health
curl -sI https://PROJECT.vercel.app/ | grep -i content-security-policy
```

Yang harus benar:

- [ ] `/api/health` mengembalikan `canGenerate: true`, `provider` bukan `demo`.
- [ ] Header CSP ada, dan `script-src` tidak memuat `unsafe-eval`.
- [ ] Onboarding berhasil dan pindah ke `/chat`.
- [ ] Pesan biasa dibalas tanpa error konsol.
- [ ] Pesan krisis memunculkan tiga nomor dari `data/hotlines.ts`.
- [ ] Modal Bantuan Darurat terbuka dan tertutup dengan Escape.
- [ ] `/bantuan` dan `/privasi` terbuka tanpa memanggil AI.
- [ ] Di ponsel 390 px tidak ada scroll horizontal.
- [ ] Rate limit mengembalikan 429 setelah melewati batas, bukan error 500.

Kalau `canGenerate: false`, env belum terbaca. Perbaiki di Environment Variables lalu Redeploy, karena deployment lama tidak mengambil nilai baru.

## 7. Hasil akhir: fitur yang berjalan dan yang belum

### Sudah berjalan dan terverifikasi

- Onboarding nama samaran, kelompok usia, dan persetujuan, dengan penjaga jika profil belum ada.
- Enam mode: obrolan bebas, check-in suasana hati, catatan pikiran, nilai dan arah, latihan menenangkan, ringkasan sesi.
- Deteksi krisis lapis 1 berbasis aturan, termasuk slang dan pengecualian idiom, dengan nomor dari satu sumber data.
- Output guard: diagnosis, obat, janji hasil, nomor asing, kebocoran prompt, dan pengakuan sebagai profesional.
- Validasi payload, penolakan role `system`, batas 15 pesan dan 1000 karakter per pesan.
- Rate limit per IP yang di-hash, dengan Upstash bila tersedia.
- Dua latihan statis tanpa AI: 5-4-3-2-1 dan pernapasan kotak.
- Ringkasan sesi, salin ke clipboard, dan unduh sebagai teks.
- Umpan balik "Membantu" dan "Kurang pas" tanpa isi percakapan.
- Konfirmasi hapus sesi, tema terang dan gelap, modal SOS dengan focus trap dan Escape.
- Halaman `/bantuan` dan `/privasi`, halaman 404 dan error.
- Header keamanan: CSP, nosniff, referrer policy, permissions policy, frame deny.
- Penyimpanan hanya di `sessionStorage`, tanpa akun, tanpa cookie, tanpa database.

Bukti terakhir: kontras lulus semua pasangan di dua tema, 69 dari 69 pemeriksaan skenario lulus, build produksi sukses dengan 8 rute.

### Belum berjalan atau belum lengkap

Ini yang harus kamu tahu sebelum menyebut aplikasi siap rilis.

1. Balasan AI sungguhan belum aktif. Saat ini provider demo, karena belum ada kunci API. Tanpa kunci di produksi, `/api/chat` menjawab 503 dengan pesan ramah.
2. Klasifikasi krisis lapis 2 berbasis LLM belum pernah diuji langsung. Skrip offline hanya menguji lapis 1, validasi, guard, dan rendering hotline.
3. Nada balasan dan kualitas ringkasan model belum dinilai manusia. Ringkasan di mode demo memakai teks contoh.
4. Rate limit produksi belum persisten tanpa Upstash. Map in-memory hilang saat instance restart.
5. Umpan balik hanya agregat in-memory. Tidak ada database, tidak ada dashboard, dan hitungan hilang saat instance restart.
6. Tidak ada monitoring, alert, atau log terpusat. Hanya `/api/health` dan status teknis.
7. `[KONTAK PENGELOLA]` di halaman privasi masih placeholder dan wajib diisi.
8. Belum ada review psikolog atau konselor untuk prompt, pola krisis, dan respons krisis.
9. Nomor hotline sudah dicek pada 2026, tetapi belum dijadwalkan pengecekan ulang berkala.
10. Belum diuji di Firefox dan Safari. Semua klik-through memakai Chromium.
11. Screen reader belum dijalankan. Semantik diperiksa lewat DOM dan snapshot aksesibilitas.
12. Unduh ringkasan sudah diklik tanpa error, tetapi isi berkas hasil unduhan belum diperiksa.
13. Di lebar 320 px tombol aksi utama di halaman depan berada sedikit di bawah lipatan. Di 390 px dan desktop sudah terlihat.
14. Error state di UI ada dan punya tombol coba lagi, tetapi belum dipicu langsung saat pengujian.
15. Deploy itu sendiri belum dilakukan. Belum ada repo, belum ada URL publik.
16. Tidak ada akun, riwayat permanen, sinkronisasi antar perangkat, notifikasi, analitik, PWA, mode offline, ekspor PDF, atau bahasa selain Indonesia. Sebagian besar ini memang di luar lingkup blueprint, bukan kerusakan.

## 8. Troubleshooting

- Halaman 500 dengan `Cannot find module './897.js'`: build menimpa `.next` milik dev server. Hentikan dev, jalankan `npm run build`, lalu `npm start`, atau nyalakan dev lagi.
- `/api/chat` 503: tidak ada kunci yang terbaca atau provider gagal. Cek `/api/health`, lalu cek `NINEROUTER_URL`, kunci, dan nama model.
- `/api/health` bilang `provider: demo` di Vercel: `NODE_ENV` production memblokir demo. Hapus `LLM_DEMO` dan isi kunci sungguhan, lalu redeploy.
- 429 terus: batas per IP tercapai. Tunggu satu menit atau naikkan `RATE_LIMIT_PER_MINUTE` untuk uji internal.
- EvalError soal `unsafe-eval` di lokal: CSP development butuh `unsafe-eval` untuk React refresh. Pastikan `NODE_ENV` bukan production dan restart dev setelah mengubah `next.config.ts`.
- Port dipakai: jalankan `npm run dev -- --port 3100`.
- Perubahan env tidak berefek: restart dev di lokal, redeploy di Vercel.

## 9. Sebelum rilis publik

- [ ] Review prompt dan respons krisis bersama psikolog atau konselor.
- [ ] Verifikasi ulang semua nomor di `data/hotlines.ts`.
- [ ] Ganti `[KONTAK PENGELOLA]` dengan kontak nyata yang aktif.
- [ ] Baca ketentuan setiap penyedia AI, termasuk kebijakan data tier gratis.
- [ ] Pasang Upstash dan uji 429 di deployment.
- [ ] Uji di Firefox dan Safari, plus satu screen reader.
- [ ] Lakukan uji tertutup dengan kelompok kecil dan catat keluhan.
- [ ] Siapkan monitoring uptime untuk `/api/health`.
- [ ] Siapkan rollback: di Vercel, gunakan Deployments lalu Promote pada deployment terakhir yang sehat.

## 10. Definition of done

Rilis dianggap selesai hanya jika semua ini benar:

- [ ] `npm run check:contrast`, `npm run test:scenarios`, dan `npm run build` lulus.
- [ ] `/api/health` di produksi menunjukkan provider sungguhan.
- [ ] Chat, krisis, SOS, ringkasan, dan tema diuji di URL publik.
- [ ] Tidak ada error konsol di halaman utama dan `/chat`.
- [ ] `[KONTAK PENGELOLA]` sudah diganti.
- [ ] Sudah ada review ahli dan uji tertutup.
