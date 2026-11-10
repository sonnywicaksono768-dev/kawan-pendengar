# 05. Maintenance dan masalah

[Kembali ke mulai di sini](00-MULAI-DI-SINI.md)

Dokumen ini dipakai saat ada yang tidak berjalan, dan untuk pemeriksaan rutin agar masalah tidak menumpuk. Untuk menyalakan layanan dari awal, buka [01 - Menyalakan dan mematikan](01-MENYALAKAN-DAN-MEMATIKAN.md). Untuk mengirim perubahan ke publik, buka [04 - Deploy ke Vercel](04-DEPLOY-KE-VERCEL.md).

## Urutan diagnosis AI tidak membalas

Ikuti urutan ini. Jangan mulai dari mengganti kode atau menghapus berkas.

1. Buka https://kawan-pendengar.vercel.app. Kalau halaman depan juga gagal, masalahnya di Vercel atau jaringan, bukan AI.
2. Periksa health publik.

   ```powershell
   curl.exe -s https://kawan-pendengar.vercel.app/api/health
   ```

   Kalau `canGenerate` bernilai `false`, environment di Vercel belum lengkap. Kalau `provider` bernilai `unconfigured`, tidak ada jalur model yang terpasang. Kalau `canGenerate` bernilai `true`, konfigurasi ada, tetapi koneksi belum tentu hidup.

3. Periksa 9Router di laptop.

   ```powershell
   (Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:20128/api/health" -TimeoutSec 10).StatusCode
   ```

   Nilai yang diharapkan adalah `200`. Kalau gagal, nyalakan 9Router lebih dulu.

4. Periksa proses tunnel.

   ```powershell
   Get-Process cloudflared -ErrorAction SilentlyContinue
   ```

   Kalau tidak ada hasil, tunnel mati. Nyalakan lagi di terminal terpisah dengan urutan 9Router dulu, baru tunnel.

5. Baca alamat tunnel yang baru dari log cloudflared. Alamat quick tunnel berakhir dengan `.trycloudflare.com` dan bisa berubah setiap restart.
6. Bandingkan alamat itu dengan `NINEROUTER_URL` di Vercel. Kalau berbeda, perbarui dan redeploy. Ikuti bagian A di [04 - Deploy ke Vercel](04-DEPLOY-KE-VERCEL.md#a-hanya-alamat-tunnel-atau-environment-yang-berubah).
7. Kirim satu pesan uji dari halaman publik. Balasan yang muncul adalah bukti jalur AI hidup.
8. Kalau masih gagal, periksa kuota, kunci, dan nama model di dashboard 9Router. Coba satu model lain sebagai pembanding.
9. Kalau memakai provider cadangan, pastikan `FALLBACK_PROVIDERS` dan kuncinya benar. Tanpa kunci cadangan, kegagalan router langsung menjadi 503.

Catatan penting: `/api/health` hanya membaca konfigurasi. Status `ok` dan `canGenerate: true` bisa muncul walaupun tunnel sudah mati. Satu pesan uji lebih dipercaya daripada health.

## Masalah umum

| Gejala | Penyebab yang sering | Tindakan |
|---|---|---|
| Balasan AI 503 | Tunnel mati, alamat tunnel berubah, atau 9Router mati | Ikuti urutan diagnosis di atas |
| 429 | Batas per IP tercapai | Tunggu satu menit, atau naikkan batas untuk uji internal |
| 400 | Pesan kosong, terlalu panjang, atau payload tidak valid | Pastikan ada pesan pengguna terakhir dan isinya di bawah 1.000 karakter |
| Halaman lokal 500 dengan `Cannot find module` | Build dan dev memakai `.next` yang sama | Hentikan dev, hapus `.next`, build ulang, lalu jalankan dev lagi |
| Build gagal mengambil font | Kembali ke `next/font/google` atau jaringan build bermasalah | Pastikan font lokal di `app/fonts` masih ada |
| Halaman publik memakai warna lama | Perubahan belum di-commit, belum di-push, atau deployment belum selesai | Cek `git status`, push, lalu lihat Deployments |
| Environment baru tidak terbaca | Deployment lama masih berjalan | Redeploy setelah menyimpan environment |
| Alamat tunnel berubah setelah restart | Quick tunnel membuat alamat baru | Perbarui `NINEROUTER_URL` dan redeploy |
| Tunnel mati saat 9Router restart | Launcher 9Router menghentikan proses cloudflared | Nyalakan 9Router dulu, lalu tunnel |
| Port 3000 atau 3100 dipakai | Server lain masih berjalan | Cari PID yang mendengarkan port, hentikan proses itu saja |
| Ringkasan hilang setelah reload | Ringkasan hanya ada di state halaman | Minta ringkasan lagi, lalu salin atau unduh |
| Tombol salin tidak bekerja | Clipboard diblokir browser | Gunakan tombol unduh, atau izinkan clipboard |
| Umpan balik hilang | Penghitung hanya di memori proses | Tidak ada data yang perlu dipulihkan |
| Tema kembali ke bawaan | `sessionStorage` diblokir atau tab baru | Pilih tema lagi, atau gunakan pengaturan sistem |
| Halaman chat meminta nama samaran lagi setelah reload | Profil tidak ada di `sessionStorage` | Isi onboarding lagi dari halaman depan |

## Menghapus folder `.next`

Lakukan hanya saat server dev dan server produksi lokal sudah berhenti.

```powershell
Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
Get-Process node -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next
& "C:\Program Files\nodejs\npm.cmd" run build
```

Jangan menghentikan semua proses Node sekaligus. Proses Node lain mungkin dipakai aplikasi lain di laptop ini.

## Memeriksa port yang dipakai

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 20128 -State Listen -ErrorAction SilentlyContinue
```

Kalau ada hasil, lihat kolom `OwningProcess`, lalu periksa proses itu sebelum dihentikan.

## Pemeriksaan rutin

### Setiap kali menyalakan layanan

- [ ] Laptop tidak masuk Sleep atau Hibernate.
- [ ] 9Router menjawab 200 di port 20128.
- [ ] Tunnel berjalan dan alamatnya cocok dengan Vercel.
- [ ] Satu pesan uji mendapat balasan.
- [ ] Halaman `/bantuan` terbuka.

### Setiap minggu

- [ ] Buka Deployments dan pastikan deployment terakhir Ready.
- [ ] Periksa `/api/health`, lalu kirim satu pesan uji.
- [ ] Periksa sisa kuota kunci model.
- [ ] Periksa apakah Upstash masih terhubung.
- [ ] Baca log Vercel untuk error 500 atau 503 yang berulang.
- [ ] Pastikan tidak ada kunci atau `.env.local` yang masuk repo.

### Setiap bulan

- [ ] Verifikasi ulang nomor di `data/hotlines.ts` dari sumber resmi.
- [ ] Jalankan `npm run check:contrast`, `npm run test:scenarios`, dan `npm run build`.
- [ ] Periksa pembaruan dependensi, terutama Next.js dan React.
- [ ] Tinjau kembali teks privasi dan kontak pengelola.
- [ ] Uji satu skenario krisis dan satu skenario curhat biasa dengan data uji.
- [ ] Periksa apakah ada perubahan perilaku model yang mencurigakan.

### Sebelum rilis luas

- [ ] Review prompt dan respons krisis bersama psikolog atau konselor.
- [ ] Ganti `[KONTAK PENGELOLA]` di halaman privasi.
- [ ] Uji di Firefox dan Safari.
- [ ] Uji dengan screen reader.
- [ ] Lakukan uji tertutup dengan kelompok kecil.
- [ ] Siapkan pemantauan uptime untuk `/api/health` dan halaman depan.

## Backup

Kode dan panduan disimpan di GitHub. Tidak ada database atau penyimpanan percakapan di server, jadi tidak ada data pengguna yang perlu dicadangkan.

Yang perlu disimpan di tempat aman:

- Nilai environment Vercel, termasuk kunci model dan `IP_HASH_SALT`, di pengelola kata sandi.
- Salinan `.env.local` di komputer yang terenkripsi, bukan di folder publik.
- Catatan alamat tunnel terbaru, walau alamat ini bisa berubah.
- Riwayat deployment Vercel, yang bisa dipakai untuk rollback.

Yang tidak perlu dicadangkan:

- `node_modules`, karena bisa dipasang ulang.
- `.next`, karena dibuat ulang saat build.
- `tsconfig.tsbuildinfo`, karena dibuat ulang.
- Isi `sessionStorage`, karena memang hanya ada di browser pengguna.

## Memperbarui dependensi

Jangan memperbarui semua paket sekaligus tanpa pemeriksaan.

```powershell
& "C:\Program Files\nodejs\npm.cmd" outdated
```

Untuk patch keamanan atau perbaikan kecil:

1. Perbarui satu paket.
2. Jalankan `npm install`.
3. Jalankan ketiga pemeriksaan.
4. Uji halaman utama, chat, tema, dan 390 px.
5. Commit kalau semua lulus.

Untuk Next.js versi mayor, baca catatan migrasi lebih dulu. Jangan memakai `npm audit fix --force`, karena perintah itu bisa menurunkan atau menaikkan versi besar tanpa peringatan.

## Kalau kunci bocor

1. Cabut kunci lama di dashboard 9Router atau penyedia model.
2. Buat kunci baru.
3. Perbarui environment Vercel untuk Production dan Preview.
4. Redeploy.
5. Periksa pemakaian kuota untuk aktivitas yang tidak dikenal.
6. Kalau kunci sempat masuk git, anggap kunci itu publik. Menghapus commit saja tidak cukup.

Jangan menaruh kunci di tangkapan layar, tiket, atau pesan chat.

## Kalau ada jawaban AI yang berbahaya

1. Catat waktu, mode, versi prompt, dan potongan jawaban seperlunya. Jangan menyimpan cerita pribadi pengguna.
2. Hentikan pemakaian publik sementara kalau jawabannya bisa membahayakan.
3. Tambahkan kasus uji ke `tests/scenarios.json` atau `tests/run-scenarios.ts`.
4. Perbaiki `lib/prompt.ts`, `lib/guard.ts`, atau `lib/crisis.ts`.
5. Naikkan `PROMPT_VERSION`.
6. Jalankan seluruh pemeriksaan.
7. Deploy ulang dan uji kasus yang sama.

Jangan hanya menghapus satu kalimat dari prompt tanpa menambah pengujian, karena pola yang sama bisa muncul lagi dengan kata lain.

## Kalau situs publik bermasalah

1. Cek apakah halaman statis terbuka. Kalau terbuka, masalahnya di API atau tunnel.
2. Kalau seluruh situs gagal, buka Vercel Deployments dan lihat status deployment terakhir.
3. Kalau deployment terakhir gagal, rollback ke deployment Ready sebelumnya.
4. Kalau deployment Ready tetapi halaman error, periksa Runtime Logs.
5. Kalau masalah berasal dari environment, perbaiki lalu redeploy.
6. Kalau perlu waktu lama, unpublish sementara lebih jujur daripada membiarkan halaman rusak. Pastikan dulu kamu tahu cara publish kembali.

## Yang tidak boleh dilakukan saat panik

- Jangan menghapus `node_modules`, `.next`, dan file konfigurasi sekaligus.
- Jangan menghentikan semua proses Node.
- Jangan mengganti kunci atau provider tanpa mencatat perubahan.
- Jangan mematikan filter keselamatan atau tombol darurat agar tes lulus.
- Jangan menguji nomor darurat dengan menelepon.
- Jangan memakai curhat pribadi pengguna untuk pengujian atau tangkapan layar.
- Jangan mengunggah `.env.local` ke chat, issue, atau layanan lain.

## Daftar periksa akhir

- [ ] Penyebab masalah ditemukan, bukan hanya gejalanya.
- [ ] Perubahan diuji di lokal.
- [ ] Kontras, skenario, dan build lulus.
- [ ] Environment Vercel diperbarui kalau perlu.
- [ ] Deployment baru berstatus Ready.
- [ ] Satu pesan uji berhasil.
- [ ] Jalur krisis masih memunculkan tiga nomor.
- [ ] Tidak ada kunci baru yang masuk repo.
