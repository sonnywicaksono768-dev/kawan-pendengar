# 04. Deploy ke Vercel

[Kembali ke mulai di sini](00-MULAI-DI-SINI.md)

Aplikasi ini memakai dua tempat yang berbeda:

- GitHub menyimpan kode.
- Vercel menjalankan halaman publik dan API.

Vercel tidak menjalankan 9Router di laptop. Kalau memakai jalur 9Router, balasan AI hanya hidup selama laptop, 9Router, dan tunnel menyala. Lihat [01 - Menyalakan dan mematikan](01-MENYALAKAN-DAN-MEMATIKAN.md).

Alamat yang dipakai saat panduan ini dibuat:

| Keperluan | Alamat |
|---|---|
| Website publik | https://kawan-pendengar.vercel.app |
| Repository | https://github.com/sonnywicaksono768-dev/kawan-pendengar |
| Dashboard 9Router | http://localhost:20128 |
| Folder proyek | `C:\laragon\www\Psikolog\kawan-pendengar` |

## Alur singkat

```text
Ubah kode di laptop
        |
        v
Commit dan push ke GitHub
        |
        v
Vercel membangun ulang otomatis
        |
        v
Uji halaman publik
```

Perubahan environment tidak ikut terkirim lewat push. Setelah mengubah environment di Vercel, selalu buat deployment baru.

## A. Hanya alamat tunnel atau environment yang berubah

Bagian ini dipakai kalau kode tidak berubah, tetapi `NINEROUTER_URL` atau variabel lain perlu diperbarui. Alamat quick tunnel Cloudflare bisa berubah setiap kali tunnel dinyalakan ulang.

1. Buka dashboard Vercel dan pilih proyek `kawan-pendengar`.
2. Buka Settings, lalu Environment Variables.
3. Cari `NINEROUTER_URL`.
4. Ganti nilainya dengan alamat HTTPS baru dari terminal cloudflared. Jangan tambahkan `/login`, `/v1`, atau `/v1/chat/completions`.
5. Simpan.
6. Buka tab Deployments, pilih deployment terakhir, lalu Redeploy.
7. Tunggu sampai status Ready.
8. Uji dengan satu pesan biasa, bukan hanya halaman depan.

Kalau hanya mengubah environment, tidak perlu push commit baru. Sebaliknya, push commit baru tidak akan mengambil nilai environment yang belum disimpan.

Jangan mengisi `localhost` atau `127.0.0.1` pada environment Vercel. Dari mesin Vercel, alamat itu menunjuk ke mesin Vercel sendiri, bukan laptop pemilik.

## B. Setelah mengubah kode

Jalankan dari folder proyek:

```powershell
Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
git status
git diff
```

Periksa daftar berkas. Jangan lanjut kalau `.env.local`, kunci API, atau berkas rahasia lain ikut muncul.

Jalankan pemeriksaan sebelum commit:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run check:contrast
& "C:\Program Files\nodejs\npm.cmd" run test:scenarios
& "C:\Program Files\nodejs\npm.cmd" run build
```

Hentikan server dev sebelum build. Kalau tidak, folder `.next` bisa tertimpa dan halaman lokal menampilkan error `Cannot find module`.

Setelah semua lulus:

```powershell
git add app components lib data scripts tests README.md DESIGN.md PANDUAN
git status
git commit -m "Jelaskan perubahan yang dilakukan"
git push origin main
```

Ganti pesan commit dengan kalimat yang menjelaskan alasan perubahan. Contoh: "Perjelas tombol darurat di layar kecil".

Folder `PANDUAN` belum masuk git saat panduan ini dibuat. Perintah `git add PANDUAN` di atas akan menambahkannya. Kalau tidak ingin panduan ikut ke repo publik, lewati bagian itu, tetapi simpan salinannya di tempat lain.

Setelah push, buka tab Deployments di Vercel. Deployment baru akan berjalan otomatis. Tunggu sampai status Ready, lalu lanjut ke bagian G.

## C. Deploy pertama kali atau proyek baru

Bagian ini hanya untuk proyek Vercel baru. Proyek yang sekarang sudah terhubung dan tidak perlu diimpor ulang.

1. Buka vercel.com, klik Add New, lalu Project.
2. Pilih Import Git Repository dan hubungkan akun GitHub.
3. Pilih repo `kawan-pendengar`.
4. Framework Preset akan terdeteksi sebagai Next.js. Biarkan Build Command `next build` dan Install Command `npm install`.
5. Kalau repo berisi seluruh folder `Psikolog`, isi Root Directory dengan `kawan-pendengar`.
6. Buka Environment Variables dan isi variabel di bawah.
7. Klik Deploy.

### Environment variables

Isi untuk environment Production dan Preview. Nilai kunci tidak boleh ditulis di panduan, chat, atau repo.

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NINEROUTER_URL` | jika memakai 9Router | Alamat dasar tanpa `/v1` |
| `NINEROUTER_API_KEY` | jika memakai 9Router | Kunci dari dashboard 9Router |
| `LLM_MODEL` | jika memakai 9Router | Model utama |
| `LLM_CLASSIFIER_MODEL` | jika memakai 9Router | Model untuk klasifikasi krisis lapis 2 |
| `FALLBACK_PROVIDERS` | opsional | Contoh: `gemini,groq,openrouter` |
| `GEMINI_API_KEY` | jika memakai Gemini | Salah satu jalur cadangan |
| `GROQ_API_KEY` | jika memakai Groq | Salah satu jalur cadangan |
| `OPENROUTER_API_KEY` | jika memakai OpenRouter | Salah satu jalur cadangan |
| `IP_HASH_SALT` | ya | String acak panjang, berbeda dari contoh |
| `LLM_TIMEOUT_MS` | opsional | Bawaan 20.000 milidetik |
| `RATE_LIMIT_PER_MINUTE` | opsional | Bawaan 20 |
| `RATE_LIMIT_PER_DAY` | opsional | Bawaan 200 |
| `UPSTASH_REDIS_REST_URL` | sangat disarankan | Pembatas lintas instance |
| `UPSTASH_REDIS_REST_TOKEN` | sangat disarankan | Pasangan URL di atas |
| `STREAMING_ENABLED` | opsional | Biarkan `false` |

Jangan mengisi `LLM_DEMO` di Vercel. Mode demo hanya untuk lokal dan tidak aktif di production.

### Rate limit dengan Upstash

Tanpa Upstash, pembatas permintaan disimpan di memori tiap instance. Di Vercel, setiap instance punya memori sendiri, jadi batas per IP tidak konsisten.

1. Buka Storage atau Integrations di dashboard Vercel.
2. Tambahkan Upstash Redis dan hubungkan ke proyek.
3. Pastikan `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` tersedia.
4. Kalau integrasi hanya memberi nama `KV_REST_API_URL` dan `KV_REST_API_TOKEN`, salin nilainya ke dua nama `UPSTASH_` tersebut.
5. Redeploy setelah environment berubah.

### Batas durasi

Route chat memakai `maxDuration = 60`. Waktu tunggu model diatur `LLM_TIMEOUT_MS`, bawaannya 20 detik, dan ada kemungkinan satu kali regenerasi. Batas durasi plan Vercel bisa berubah, jadi periksa dokumentasi Vercel sebelum menaikkan angka ini.

## D. Kalau build gagal

Buka Deployments, pilih deployment yang gagal, lalu buka Build Logs. Cari baris error pertama, bukan baris terakhir.

Penyebab yang sering muncul:

- Environment wajib belum diisi.
- TypeScript menemukan kesalahan tipe.
- Font atau aset tidak ditemukan.
- Build dijalankan saat folder `.next` sedang dipakai server dev.
- Versi Node di Vercel berbeda dari lokal.

Jalankan `npm run build` di laptop lebih dulu. Kalau lokal lulus dan Vercel gagal, bandingkan log build dan versi Node.

## E. Rollback ke versi sebelumnya

1. Buka Deployments.
2. Pilih deployment terakhir yang statusnya Ready dan perilakunya benar.
3. Buka menu tiga titik, lalu Promote to Production.
4. Uji halaman publik setelah rollback.

Rollback tidak mengubah environment. Kalau masalahnya berasal dari environment yang salah, perbaiki nilainya lalu redeploy.

Cara lain: balikkan commit di git, lalu push. Cara ini lebih lambat, tetapi riwayat kode tetap jelas.

## F. Preview deployment

Setiap pull request atau branch biasanya mendapat URL preview sendiri. Preview memakai environment Preview, jadi pastikan variabel untuk Preview juga diisi.

Preview berguna untuk menguji perubahan sebelum masuk `main`. URL preview juga publik, jadi jangan menganggapnya sebagai ruang privat.

## G. Verifikasi setelah deploy

Ganti alamat kalau domain berubah.

```powershell
curl.exe -s https://kawan-pendengar.vercel.app/api/health
curl.exe -sI https://kawan-pendengar.vercel.app/ | Select-String "content-security-policy"
```

Yang harus terlihat:

- `canGenerate` bernilai `true`.
- `provider` bukan `demo`.
- `promptVersion` sama dengan `PROMPT_VERSION` di `lib/prompt.ts`.
- Header CSP ada dan tidak memuat `unsafe-eval`.

`/api/health` hanya memeriksa konfigurasi. Nilai `true` tidak membuktikan tunnel hidup. Uji satu pesan biasa:

```powershell
$body = @{
  mode = "free_chat"
  messages = @(@{ role = "user"; content = "Halo, ini pesan uji. Balas satu kalimat singkat." })
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post `
  -Uri "https://kawan-pendengar.vercel.app/api/chat" `
  -ContentType "application/json" `
  -Body $body
```

Lalu uji jalur krisis dengan kalimat uji, bukan cerita pribadi:

```powershell
$body = @{
  mode = "free_chat"
  messages = @(@{ role = "user"; content = "aku mau bunuh diri" })
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post `
  -Uri "https://kawan-pendengar.vercel.app/api/chat" `
  -ContentType "application/json" `
  -Body $body
```

Balasan krisis harus memuat 119 ext. 8, 112, dan 129. Jangan menelepon nomor tersebut hanya untuk menguji tombol.

Periksa juga:

- [ ] Halaman depan terbuka dan formulir bisa diisi.
- [ ] `/chat` bisa dipakai setelah onboarding.
- [ ] `/bantuan` dan `/privasi` terbuka tanpa AI.
- [ ] Tombol darurat membuka dialog dan bisa ditutup dengan Escape.
- [ ] Tidak ada error di konsol browser.
- [ ] Di 390 px tidak ada scroll horizontal.

## H. Yang tidak dilakukan Vercel

- Vercel tidak menyalakan 9Router di laptop.
- Vercel tidak menjaga tunnel Cloudflare tetap hidup.
- Vercel tidak menyimpan percakapan pengguna.
- Vercel tidak menjalankan cron atau proses latar belakang untuk proyek ini.
- Vercel tidak memperbarui environment otomatis saat nilai di laptop berubah.

Kalau laptop dimatikan, halaman statis dan jalur krisis lokal tetap bisa dibuka, tetapi balasan AI lewat 9Router akan gagal. Pesan error 503 yang muncul adalah perilaku yang sudah dirancang, bukan halaman rusak.
