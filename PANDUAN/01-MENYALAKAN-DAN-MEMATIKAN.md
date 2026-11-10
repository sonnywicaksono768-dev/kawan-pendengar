# 01. Menyalakan dan mematikan

[Kembali ke mulai di sini](00-MULAI-DI-SINI.md)

Semua perintah PowerShell di bawah dijalankan **di laptop pemilik yang menyimpan proyek**, bukan di HP pengguna, dashboard Vercel, atau komputer lain. Buka PowerShell biasa; tidak perlu Run as administrator. Path lengkap dipakai agar tidak bergantung pada pengaturan PATH atau izin menjalankan `.ps1`.

## A. Setelah laptop dinyalakan lagi: pulihkan AI di website publik

### 1. Sambungkan internet

Untuk tetap melayani pengguna, laptop harus menyala, terhubung internet, dan tidak masuk Sleep/Hibernate. Mematikan layar saja tidak sama dengan menidurkan laptop. Periksa pengaturan daya Windows, terutama saat layar laptop ditutup. Jangan menonaktifkan pembaruan keamanan Windows.

### 2. Periksa apakah 9Router sudah berjalan

Buka http://localhost:20128 di browser laptop. Jika dashboard 9Router sudah terbuka, **jangan menjalankan salinan kedua**; lanjutkan ke langkah 3. Jika ada ikon 9Router di system tray Windows, periksa juga dari sana.

Jika belum berjalan, buka **PowerShell 1** dan jalankan:

```powershell
& "C:\Program Files\nodejs\node.exe" "C:\Users\sonny\AppData\Roaming\npm\node_modules\9router\cli.js" --port 20128 --skip-update
```

Tunggu hingga server siap/menu 9Router muncul. Biarkan PowerShell 1 terbuka dan gunakan menu normal, tidak perlu memilih Hide/background. Opsi `--skip-update` hanya melewati pemeriksaan pembaruan saat startup, bukan alasan untuk mengabaikan maintenance keamanan.

Perintah ini sesuai dengan instalasi 9Router 0.5.116 yang diperiksa pada 10 November 2026. Jika pindah akun Windows atau menginstal ulang, path dapat berubah.

### 3. Pastikan router siap, kemudian nyalakan tunnel

Buka **PowerShell 2** di laptop pemilik:

```powershell
(Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:20128/api/health" -TimeoutSec 10).StatusCode
```

Lanjutkan setelah muncul `200`. Ini memastikan endpoint router menjawab, belum membuktikan model AI berhasil.

Jika tunnel yang benar sudah berjalan dan web publik masih bisa membalas, biarkan tetap berjalan; tidak perlu membuat tunnel kedua. Jika belum ada, jalankan di PowerShell 2:

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:20128
```

**Urutannya harus 9Router dahulu, baru tunnel.** Launcher 9Router pada instalasi ini dapat menghentikan proses cloudflared yang mengarah ke port yang sama saat startup. Karena itu, setelah restart 9Router, periksa dan nyalakan kembali tunnel bila perlu.

Biarkan PowerShell 2 terbuka. Tunggu log menampilkan alamat HTTPS berakhiran `.trycloudflare.com` dan koneksi tunnel terdaftar. Catat alamat dasar itu untuk konfigurasi sendiri, tanpa menambahkan `/login`, `/v1`, atau `/v1/chat/completions`.

### 4. Cocokkan alamat tunnel dengan Vercel

Quick tunnel dapat memperoleh alamat baru setelah dinyalakan ulang. Jangan mengandalkan alamat dari screenshot atau percakapan lama.

1. Buka dashboard Vercel, pilih proyek **kawan-pendengar**.
2. Buka **Settings > Environment Variables**.
3. Cari `NINEROUTER_URL` untuk lingkungan **Production**.
4. Jika berbeda, ganti dengan alamat dasar HTTPS yang baru dari PowerShell 2, lalu simpan.
5. Setelah perubahan environment, buat deployment baru. Ikuti [panduan deploy, bagian A](04-DEPLOY-KE-VERCEL.md#a-hanya-alamat-tunnel-atau-environment-yang-berubah).

Jangan mengisi `localhost` pada environment Vercel: dari Vercel, alamat itu menunjuk ke mesin Vercel sendiri, bukan laptop ini. `NINEROUTER_API_KEY` hanya perlu diganti jika kunci di 9Router memang berubah.

### 5. Uji dari website publik

Buka https://kawan-pendengar.vercel.app, isi nama samaran uji dan persetujuan, lalu kirim pesan biasa seperti: `Hari ini agak melelahkan, aku ingin merapikan pikiranku.`

Balasan yang tampil adalah bukti jalur AI bekerja. Berhasil membuka homepage atau memperoleh status health `ok` saja belum cukup. Jika gagal, ikuti [urutan diagnosis](05-MAINTENANCE-DAN-MASALAH.md#urutan-diagnosis-ai-tidak-membalas).

**Selesai. Untuk melayani pengguna lewat Vercel, tidak perlu menjalankan `npm run dev` atau `npm start` di laptop.**

## B. Menjalankan web lokal untuk mengedit UI

Buka PowerShell tambahan **di laptop pemilik**:

```powershell
Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
& "C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
```

Tunggu tulisan Ready, lalu buka http://127.0.0.1:3000. Biarkan terminal ini terbuka. Simpan perubahan kode di Qoder; server pengembangan biasanya memperbarui tampilan secara otomatis.

Untuk mencoba AI lokal, pastikan 9Router menyala. Di file `.env.local` yang sudah ada, alamat lokal dapat memakai:

```dotenv
NINEROUTER_URL=http://localhost:20128
```

Pertahankan kunci API yang benar dan pengaturan lainnya. **Jangan menimpa seluruh `.env.local` dengan contoh ini.** Hentikan dan jalankan kembali server web lokal sesudah mengubah environment. Tunnel tidak diperlukan untuk jalur lokal ini. Konfigurasi tersebut tidak mengubah environment Vercel.

Jika hanya mengerjakan tampilan, router boleh tidak menyala; kegagalan mendapatkan balasan AI saat itu bukan kerusakan CSS. Jangan menganggap balasan demo sebagai pengujian AI nyata.

### Jika proyek baru dipulihkan atau dependensi belum dipasang

Di laptop pemilik, pada folder proyek, jalankan sekali sebelum `run dev`:

```powershell
Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
& "C:\Program Files\nodejs\npm.cmd" ci
```

`ci` memasang dependensi sesuai lockfile dan mengganti isi `node_modules`. Jangan menjalankannya setiap kali menyalakan web atau saat server proyek masih berjalan. Langkah ini membutuhkan internet.

## C. Menguji hasil build produksi di laptop

Hentikan server pengembangan proyek ini terlebih dahulu dengan Ctrl+C. Jangan menjalankan build sambil memakai server pengembangan dari folder yang sama karena keduanya memakai `.next`.

**PowerShell di laptop pemilik:**

```powershell
Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
& "C:\Program Files\nodejs\npm.cmd" run build
```

Hanya setelah build selesai tanpa error:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run start -- --hostname 127.0.0.1 --port 3000
```

Buka http://127.0.0.1:3000. Pada mode ini, perubahan kode membutuhkan build ulang; `start` tidak menggantikan `build`. Port 3111 yang pernah dipakai saat pemeriksaan adalah port uji sementara, bukan keharusan aplikasi.

## D. Mematikan dengan tertib

1. Jika ada pengguna, beri tahu bahwa balasan AI akan terganggu selama maintenance.
2. Hentikan web lokal jika berjalan: Ctrl+C di terminal web lokal.
3. Hentikan tunnel: Ctrl+C di terminal cloudflared.
4. Pada menu 9Router, pilih **Exit**. Jika berjalan melalui tray, gunakan perintah keluar dari ikon 9Router.
5. Baru matikan/restart laptop bila perlu.

Gunakan menu Exit untuk 9Router, jangan hanya menutup jendela atau mengandalkan Ctrl+C pada menu interaktif. Proses server anak dapat tertinggal pada Windows. Untuk memastikan port router sudah tidak mendengarkan sebelum backup, jalankan di PowerShell laptop:

```powershell
Get-NetTCPConnection -LocalPort 20128 -State Listen -ErrorAction SilentlyContinue
```

Jika masih ada hasil, router atau proses lain masih mendengarkan. Periksa pemilik proses; jangan mengakhiri semua proses Node secara massal.

Menutup browser dashboard 9Router saja tidak selalu mematikan server. Sebaliknya, saat laptop benar-benar tidur/mati, Vercel tidak bisa memakai router tersebut. Prosedur restart di dokumen ini diverifikasi dari launcher terpasang; restart penuh tidak dilakukan saat penulisan agar layanan yang berjalan tidak terputus.
