# Kawan Pendengar

Pendamping refleksi diri berbasis AI untuk pengguna Indonesia. Ruang bercerita anonim yang mendengarkan, membantu menamai emosi, dan menemukan langkah kecil. Dibangun mengikuti `../blueprint-arsitektur-sistem.md`.

Ini bukan psikolog, bukan dokter, dan bukan layanan darurat.

## Menjalankan

```bash
cd kawan-pendengar
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Panduan rilis lengkap, termasuk deploy ke Vercel lewat GitHub dan daftar fitur yang belum berjalan, ada di [PANDUAN-DEPLOY.md](PANDUAN-DEPLOY.md).

Untuk mencoba alur penuh tanpa kunci API, isi `LLM_DEMO=1` di `.env.local`. Mode demo hanya aktif di luar production dan mengembalikan balasan contoh. Tanpa kunci dan tanpa mode demo, jalur AI mengembalikan pesan ramah 503, sementara tombol Bantuan Darurat dan halaman `/bantuan` tetap berfungsi.

## Arsitektur

| Layer | Berkas | Tanggung jawab |
|---|---|---|
| 1. Front-end | `app/`, `components/` | Onboarding, chat, mode, SOS, tema, sessionStorage |
| 2. Back-end | `app/api/chat/route.ts`, `lib/` | Validasi, rate limit, deteksi krisis, prompt, fallback, output guard |
| 3. 9Router | `lib/llm.ts` | `NINEROUTER_URL` + `/v1/chat/completions`, timeout, lalu fallback |
| 4. Provider | `lib/llm.ts` | Gemini, Groq, OpenRouter, urut sesuai `FALLBACK_PROVIDERS` |

### Alur satu pesan

1. `POST /api/chat` dengan `{ mode, messages }`.
2. Rate limit per IP yang di-hash, lalu validasi skema. Role `system` dari client ditolak.
3. Lapis 1 krisis: normalisasi slang, pengecualian idiom, pola eksplisit dan tersirat, dibaca dari lima pesan terakhir.
4. Lapis 2: klasifikasi singkat hanya untuk pesan yang masih ambigu secara emosional. Gagal klasifikasi berarti lanjut dengan hati-hati.
5. Krisis menghentikan alur AI normal dan mengembalikan respons hangat dengan kontak dari `data/hotlines.ts`.
6. Selain krisis: knowledge base dipilih lewat tag, prompt mode disusun, lalu 9Router dicoba. Jika gagal, provider langsung dicoba berurutan.
7. Output guard memeriksa diagnosis, obat, janji hasil, nomor asing, kebocoran prompt, dan pengakuan sebagai profesional. Pelanggaran memicu satu regenerasi, lalu balasan aman cadangan.

### Kontrak API

- `POST /api/chat` mengembalikan `reply`, `crisis`, atau `error`, dengan status `200`, `400`, `429`, atau `503`.
- `POST /api/feedback` hanya menerima label `helpful` atau `not_helpful` beserta mode. Tidak ada isi percakapan.
- `GET /api/health` mengembalikan status, versi prompt, dan jenis provider tanpa membocorkan kunci.

## Keamanan dan privasi

- Tidak ada akun, email, atau kata sandi.
- Riwayat hanya di `sessionStorage`, maksimal 15 pesan dikirim ke server, hilang saat tab ditutup.
- Tidak ada isi pesan di log server. Hanya status teknis dan penghitung agregat.
- IP di-hash dengan `IP_HASH_SALT` sebelum dipakai sebagai kunci rate limit.
- Semua kunci API hanya di environment server. CSP, `X-Content-Type-Options`, `Referrer-Policy`, dan `Permissions-Policy` dipasang di `next.config.ts`.
- Nomor darurat hanya berasal dari `data/hotlines.ts` dan dirender sistem, bukan oleh model.

## Verifikasi

```bash
npm run check:contrast
npm run test:scenarios
npm run build
```

`check:contrast` mengukur kedua tema dan keluar dengan status bukan nol bila ada pasangan gagal. `test:scenarios` memeriksa 46 skenario krisis dan idiom, validasi payload, output guard, dan rendering hotline tanpa memerlukan kunci API.

Yang belum bisa dibuktikan skrip offline: nada balasan model, lapis 2 klasifikasi, dan kepatuhan penyedia. Itu perlu uji langsung dan review ahli (blueprint bagian 21).

## Sebelum rilis publik

- [ ] Tinjau prompt, pola krisis, dan respons krisis bersama psikolog atau konselor.
- [ ] Verifikasi ulang seluruh nomor di `data/hotlines.ts`.
- [ ] Ganti `[KONTAK PENGELOLA]` di halaman privasi.
- [ ] Baca ketentuan setiap penyedia AI, termasuk kebijakan data tier gratis dan larangan multi-akun.
- [ ] Jalankan uji tertutup dengan kelompok kecil.
- [ ] Siapkan 9Router dengan autentikasi dan monitoring `/health` bila memakai Layer 3.

## Catatan operasional

- `LLM_DEMO=1` hanya untuk pengembangan lokal, tidak pernah aktif di production.
- `STREAMING_ENABLED` ada di konfigurasi tetapi alur default tetap non-streaming agar output guard selalu berjalan sebelum balasan sampai ke pengguna.
- Rate limit memakai Upstash REST bila tersedia, dan Map in-memory sebagai cadangan.
