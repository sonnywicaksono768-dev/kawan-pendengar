# 03. Mengubah UI dan AI

[Kembali ke mulai di sini](00-MULAI-DI-SINI.md)

Dokumen ini menunjukkan berkas mana yang perlu dibuka saat ingin mengubah tampilan, tulisan, atau perilaku AI. Baca [DESIGN.md](../DESIGN.md) lebih dulu, karena arah warna, huruf, dan gerak sudah dicatat di sana.

Semua perubahan dilakukan di berkas sumber. Jangan mengedit isi `.next`, `node_modules`, atau `tsconfig.tsbuildinfo`, karena ketiganya dibuat ulang oleh Next.js.

## Peta berkas

| Berkas | Isi | Kapan dibuka |
|---|---|---|
| `app/globals.css` | Warna, jarak, ukuran huruf, tombol, kartu, header, chat, dan breakpoint | Hampir semua perubahan tampilan |
| `app/layout.tsx` | Font, metadata, warna browser, dan skrip tema awal | Mengganti font atau judul tab |
| `app/(site)/page.tsx` | Halaman depan, daftar enam mode, dan daftar batas layanan | Mengubah teks halaman depan |
| `app/(site)/bantuan/page.tsx` | Halaman bantuan, nomor darurat, dan latihan statis | Mengubah teks bantuan |
| `app/(site)/privasi/page.tsx` | Kebijakan privasi dan batas layanan | Mengubah teks privasi |
| `app/(site)/layout.tsx` | Header dan footer halaman publik | Menambah halaman publik baru |
| `app/chat/page.tsx` | Pembungkus halaman ruang obrolan | Mengubah kerangka chat |
| `components/OnboardingForm.tsx` | Nama samaran, usia, persetujuan, dan pesan kesalahan | Mengubah formulir awal |
| `components/ChatRoom.tsx` | Keadaan chat, pilihan mode, ringkasan, dan hapus sesi | Mengubah alur ruang obrolan |
| `components/ChatWindow.tsx` | Gelembung pesan, umpan balik, dan daftar hotline | Mengubah tampilan pesan |
| `components/MessageInput.tsx` | Kotak pesan, penghitung karakter, dan tombol kirim | Mengubah cara mengirim pesan |
| `components/ModeSelector.tsx` | Dropdown di layar kecil dan tab di layar lebar | Mengubah nama atau urutan mode |
| `components/GroundingExercise.tsx` | Latihan 5-4-3-2-1 dan pernapasan kotak | Mengubah langkah latihan |
| `components/SosButton.tsx` | Tombol dan dialog bantuan darurat | Mengubah tombol darurat |
| `components/ThemeToggle.tsx` | Tombol terang dan gelap | Mengubah perilaku tema |
| `components/SiteHeader.tsx` | Merek, navigasi, tema, dan tombol darurat | Mengubah header publik |
| `components/SiteFooter.tsx` | Tautan footer | Mengubah footer |
| `components/Icon.tsx` | Kumpulan ikon SVG | Menambah atau mengganti ikon |
| `data/hotlines.ts` | Satu-satunya sumber nomor darurat | Menambah atau memperbarui nomor |
| `data/knowledge.json` | Delapan bahan referensi untuk AI | Menambah bahan psikoedukasi |
| `lib/prompt.ts` | Peran AI, aturan keselamatan, gaya bicara, dan prompt per mode | Mengubah cara AI menjawab |
| `lib/crisis.ts` | Pola kata krisis, pengecualian idiom, dan balasan krisis | Mengubah deteksi atau balasan krisis |
| `lib/guard.ts` | Filter keluaran AI | Mengubah larangan pada balasan |
| `lib/llm.ts` | Pemanggilan 9Router, provider cadangan, dan klasifikasi lapis 2 | Mengubah jalur model |
| `lib/config.ts` | Nama environment dan nilai bawaan | Menambah pengaturan server |
| `lib/validate.ts` | Daftar mode, batas pesan, dan validasi payload | Mengubah mode atau batas masukan |
| `lib/session.ts` | Penyimpanan sesi di browser dan batas 15 pesan | Mengubah cara sesi disimpan |
| `lib/ratelimit.ts` | Pembatas permintaan lewat Upstash atau memori | Mengubah cara pembatasan |
| `next.config.ts` | CSP dan header keamanan | Mengubah kebijakan keamanan |
| `tests/scenarios.json` | Daftar kasus krisis dan idiom | Menambah kasus uji |
| `scripts/check-contrast.mjs` | Daftar warna dan pasangan kontras | Setiap kali warna berubah |
| `DESIGN.md` | Alasan di balik warna, huruf, dan gerak | Sebelum mengubah arah visual |

## Pintasan

| Ingin mengubah | Buka |
|---|---|
| Warna, jarak, tombol, atau kartu | `app/globals.css` |
| Warna bilah browser di HP | `app/layout.tsx` |
| Font | `app/fonts` dan `app/layout.tsx` |
| Teks halaman depan | `app/(site)/page.tsx` |
| Teks bantuan atau privasi | `app/(site)/bantuan/page.tsx` dan `app/(site)/privasi/page.tsx` |
| Formulir nama samaran | `components/OnboardingForm.tsx` |
| Nama atau urutan mode | `components/ModeSelector.tsx`, `lib/validate.ts`, dan `lib/prompt.ts` |
| Nada jawaban AI | `lib/prompt.ts` |
| Deteksi krisis | `lib/crisis.ts` dan `tests/scenarios.json` |
| Nomor darurat | `data/hotlines.ts` |
| Model atau penyedia | `lib/config.ts` dan environment Vercel |

## Mengubah warna

Warna disimpan sebagai variabel CSS di `app/globals.css`. Ada tiga tempat yang harus tetap sama:

1. `:root` untuk tema terang.
2. `[data-theme="dark"]` untuk tema gelap yang dipilih pengguna.
3. `@media (prefers-color-scheme: dark)` di dalam `:root:not([data-theme="light"])` untuk pengguna yang belum memilih tema.

Contoh mengubah warna utama:

```css
:root {
  --primary: #2f6b46;
  --on-primary: #f7fbf7;
}
```

Ubah juga pasangan gelapnya, jangan hanya tema terang. Setelah itu buka `scripts/check-contrast.mjs` dan samakan nilai `light` dan `dark` di sana. Skrip ini menyimpan kode hex sendiri, bukan membaca variabel CSS, jadi angkanya harus diperbarui manual.

Jalankan:

```powershell
Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
& "C:\Program Files\nodejs\npm.cmd" run check:contrast
```

Skrip harus berhenti dengan status 0. Kalau ada pasangan di bawah 4.5:1 untuk teks atau 3:1 untuk garis dan fokus, perbaiki dulu sebelum melanjutkan.

Warna browser di HP juga perlu disesuaikan di `app/layout.tsx`, pada `viewport.themeColor`. Ganti dua nilai di sana agar bilah browser tidak memakai warna lama.

## Mengubah tulisan

Sebagian besar teks berada di halaman dan komponen, bukan di prompt.

| Teks | Berkas |
|---|---|
| Judul, paragraf pembuka, daftar mode, daftar batas | `app/(site)/page.tsx` |
| Persetujuan awal dan pesan kesalahan formulir | `components/OnboardingForm.tsx` |
| Pesan kosong dan chip saran di chat | `components/ChatRoom.tsx` |
| Label tombol, umpan balik, dan ringkasan | `components/ChatWindow.tsx` dan `components/ChatRoom.tsx` |
| Halaman bantuan dan latihan statis | `app/(site)/bantuan/page.tsx` |
| Kebijakan privasi | `app/(site)/privasi/page.tsx` |
| Gaya bicara AI | `lib/prompt.ts` |

Aturan penulisan yang dipakai aplikasi ini:

- Pakai "aku" dan "kamu", bukan "Anda" atau "saya".
- Tulis pendek dan tenang. Hindari istilah klinis yang tidak dijelaskan.
- Jangan menjanjikan hasil, mendiagnosis, atau menyebut obat.
- Jangan menulis nomor darurat di teks bebas. Nomor hanya berasal dari `data/hotlines.ts`.
- Jangan memakai em dash. Pakai koma, titik, titik dua, atau tanda kurung.
- Jangan menambah klaim privasi yang tidak benar. Pesan tetap diproses penyedia AI pihak ketiga.

Kalau mengubah teks krisis, baca juga bagian "Mengubah perilaku AI" dan jalankan ulang seluruh skenario.

## Mengubah tata letak

Hampir semua tata letak ada di `app/globals.css`. Cari nama kelas yang dipakai komponen, misalnya `.hero-grid`, `.chat-tools`, atau `.composer`, lalu ubah di berkas itu.

Breakpoint utama:

- `40rem` atau 640 px: dropdown mode berganti menjadi tab, label tombol darurat berubah dari "Darurat" menjadi "Bantuan darurat".
- `52rem` atau 832 px: header kembali menjadi satu baris dan navigasi pindah ke tengah.

Saat mengubah header, perhatikan `scroll-padding-block-start` dan `scroll-margin-block` di `globals.css`. Keduanya menjaga agar kontrol yang menerima fokus tidak tertutup header lengket.

Halaman chat memakai `.chat-shell` dengan tiga baris: bagian atas, isi, dan composer. Composer bersifat sticky di bawah. Kalau mengubah tinggi header atau composer, uji ulang di 320 px dan 390 px.

## Mengubah font

Font disimpan di `app/fonts` dan dimuat lewat `next/font/local` di `app/layout.tsx`.

Langkah mengganti font:

1. Siapkan berkas `.woff2` dengan subset Latin.
2. Letakkan di `app/fonts`.
3. Ubah `src`, `weight`, dan `variable` di `app/layout.tsx`.
4. Pastikan nama variabel tetap `--font-jakarta` dan `--font-fraunces`, atau ubah juga `--font-sans` dan `--font-display` di `globals.css`.
5. Jalankan build untuk memastikan berkas terbaca.

Jangan kembali ke `next/font/google` tanpa alasan. Build Vercel pernah gagal karena tidak bisa mengambil font dari Google, dan font lokal menghilangkan ketergantungan itu.

## Mengubah perilaku AI

### Prompt utama

Buka `lib/prompt.ts`. Bagian yang biasanya diubah:

- `SYSTEM_PROMPT`: peran, gaya bicara, aturan kejujuran, keselamatan, dan ketahanan terhadap manipulasi.
- `MODE_PROMPTS`: tambahan instruksi untuk tiap mode.
- `FEW_SHOT`: contoh percakapan yang menunjukkan nada yang diinginkan.
- `SAFE_FALLBACK_REPLY`: balasan terakhir kalau dua percobaan menghasilkan pelanggaran.
- `REGENERATION_INSTRUCTION`: perintah saat balasan pertama melanggar aturan.

Setelah mengubah prompt, naikkan `PROMPT_VERSION`, misalnya dari `1.1.0` menjadi `1.2.0`. Nilai ini muncul di `/api/health` dan berguna untuk memastikan versi yang berjalan di Vercel memang versi terbaru.

Jangan menghapus aturan keselamatan untuk membuat model lebih bebas. Jangan menambahkan nomor telepon ke prompt, karena nomor hanya boleh dirender sistem dari `data/hotlines.ts`.

### Deteksi krisis

`lib/crisis.ts` bekerja dalam beberapa bagian:

- `SLANG`: menormalkan kata seperti "gak", "gw", dan "bgt".
- `IDIOM_EXCLUSIONS`: membuang frasa aman seperti "mati lampu" dan "bunuh waktu".
- `EXPLICIT_PATTERNS`: niat atau metode yang jelas.
- `IMPLICIT_PATTERNS`: sinyal tersirat seperti "capek hidup" dan "pengen ngilang".
- `VIOLENCE_PATTERNS`: kekerasan dan pelecehan.
- `HARM_OTHERS_PATTERNS`: niat menyakiti orang lain.
- `SELF_CRISIS_RESPONSE`, `VIOLENCE_RESPONSE`, `OTHERS_RESPONSE`: balasan yang dirender sistem.

Setiap pola baru sebaiknya disertai kasus di `tests/scenarios.json`:

```json
{ "id": "implicit-12", "category": "tersirat", "messages": ["aku pengen pergi jauh dan tidak kembali"], "expect": "crisis" }
```

Gunakan `expect: "safe"` untuk kalimat sehari-hari yang mirip kata krisis. Setelah menambah kasus, jalankan:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run test:scenarios
```

Pengujian ini memeriksa lapis 1, validasi payload, filter keluaran, dan rendering hotline. Klasifikasi lapis 2 memakai model dan tidak diuji oleh skrip offline.

### Klasifikasi lapis 2

Prompt klasifikasi ada di `lib/llm.ts`, di dalam `classifyRisk`. Lapis ini hanya berjalan saat lapis 1 bersih tetapi pesan masih mengandung kata emosional seperti "capek", "hampa", atau "sendiri".

Model gratis pernah menandai stres kerja biasa sebagai krisis. Prompt saat ini membedakan "capek biasa" dari "capek hidup". Kalau mengubah daftar kata pemicu di `AMBIGUOUS_EMOTION` pada `app/api/chat/route.ts`, uji ulang dengan kalimat curhat biasa dan kalimat krisis.

### Bahan referensi

`data/knowledge.json` berisi delapan entri. Setiap entri punya `id`, `tags`, `title`, dan `content`.

Pemilihan memakai kecocokan teks biasa, bukan model vektor. Tag yang tidak pernah diketik pengguna tidak akan terpilih. Tambahkan kata yang benar-benar muncul dalam percakapan, misalnya "insomnia" atau "malu".

`selectKnowledge` mengambil maksimal dua entri per pesan. Kalau menambah banyak entri, periksa apakah dua entri teratas masih relevan.

### Nomor darurat

Semua nomor ada di `data/hotlines.ts`. Setiap entri punya `id`, `label`, `number`, `ext`, `phone`, dan `description`.

`phone` dipakai untuk tautan `tel:`. `number` dan `ext` dipakai untuk tampilan dan daftar nomor yang diizinkan filter keluaran. Setelah mengubah nomor:

1. Verifikasi nomor dari sumber resmi.
2. Perbarui deskripsi cara menghubungi.
3. Jalankan `npm run test:scenarios`.
4. Buka `/bantuan` dan uji tautan telepon tanpa benar-benar menelepon.

### Penyedia model

Nama environment ada di `lib/config.ts` dan contohnya di `.env.example`:

- `NINEROUTER_URL` dan `NINEROUTER_API_KEY` untuk 9Router.
- `LLM_MODEL` dan `LLM_CLASSIFIER_MODEL` untuk nama model.
- `GEMINI_API_KEY`, `GROQ_API_KEY`, dan `OPENROUTER_API_KEY` untuk jalur cadangan.
- `FALLBACK_PROVIDERS` untuk urutan cadangan.
- `LLM_TIMEOUT_MS` untuk batas waktu satu permintaan.

Kunci hanya boleh berada di `.env.local` dan environment Vercel. Jangan pernah memakai awalan `NEXT_PUBLIC_` untuk kunci, karena nilai itu akan ikut ke browser.

`LLM_DEMO=1` hanya untuk lokal. Di production, mode demo selalu dimatikan oleh kode, tetapi jangan mengisi variabel itu di Vercel.

## Menambah atau mengubah mode

Daftar mode ada di `lib/validate.ts`, pada `CHAT_MODES`. Setiap mode juga butuh:

1. Label di `components/ModeSelector.tsx`.
2. Prompt di `MODE_PROMPTS` pada `lib/prompt.ts`.
3. Penanganan khusus di `components/ChatRoom.tsx` kalau tampilannya berbeda.
4. Penanganan di `app/api/chat/route.ts` kalau mode tidak boleh memanggil AI, seperti `grounding`.
5. Kasus uji kalau mode memengaruhi keselamatan.

Batas masukan juga ada di `lib/validate.ts`: maksimal 15 pesan dan 1.000 karakter per pesan. Mengubah angka ini memengaruhi biaya dan panjang konteks.

## Alur kerja yang aman

1. Jalankan server lokal.

   ```powershell
   Set-Location "C:\laragon\www\Psikolog\kawan-pendengar"
   & "C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
   ```

2. Ubah satu hal, lalu lihat hasilnya di browser.
3. Uji di 390 px dan 320 px, bukan hanya di layar laptop.
4. Uji tema terang dan gelap.
5. Jalankan pemeriksaan.

   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" run check:contrast
   & "C:\Program Files\nodejs\npm.cmd" run test:scenarios
   & "C:\Program Files\nodejs\npm.cmd" run build
   ```

6. Hentikan server dev sebelum build kalau muncul error aneh, karena keduanya memakai folder `.next`.
7. Commit dan push. Vercel akan membangun ulang. Lihat [04 - Deploy ke Vercel](04-DEPLOY-KE-VERCEL.md).

## Yang sebaiknya tidak diubah

- Jangan mengedit `.next`, `node_modules`, atau `tsconfig.tsbuildinfo`.
- Jangan menaruh kunci API di komponen, halaman, atau variabel `NEXT_PUBLIC_`.
- Jangan menghapus tombol Bantuan Darurat atau halaman `/bantuan`.
- Jangan melonggarkan `lib/guard.ts` hanya agar model bisa menjawab lebih bebas.
- Jangan menambah nomor telepon ke prompt atau teks bebas.
- Jangan mengubah teks privasi menjadi klaim "tanpa pihak ketiga", karena pesan tetap dikirim ke penyedia model.
- Jangan memakai em dash pada teks yang tampil ke pengguna.

## Daftar periksa sebelum selesai

- [ ] Perubahan terlihat di tema terang dan gelap.
- [ ] Tidak ada scroll horizontal di 320 px dan 390 px.
- [ ] Target sentuh tetap minimal 44 px.
- [ ] Kontras lulus.
- [ ] Skenario krisis lulus.
- [ ] Build lulus.
- [ ] `PROMPT_VERSION` dinaikkan kalau perilaku AI berubah.
- [ ] Teks baru tidak menjanjikan hasil, tidak mendiagnosis, dan tidak menyebut obat.
- [ ] Nomor darurat masih berasal dari `data/hotlines.ts`.
