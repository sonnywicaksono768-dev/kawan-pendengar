# 02. Cara menggunakan web

[Kembali ke mulai di sini](00-MULAI-DI-SINI.md)

## Memulai obrolan

1. Buka https://kawan-pendengar.vercel.app.
2. Masuk ke formulir mulai obrolan pada halaman depan.
3. Isi **nama samaran**, 2 sampai 24 karakter. Tidak perlu nama asli.
4. Pilih kelompok usia dan baca keterangan yang muncul.
5. Baca batas layanan dan berikan persetujuan jika setuju.
6. Tekan **Mulai ngobrol**.

Tidak ada pendaftaran akun atau password pengguna. Pilihan usia dipakai pada onboarding; saat ini pilihan tersebut bukan parameter yang otomatis mengubah model AI menjadi layanan khusus anak.

## Memilih mode

Di ponsel kecil, gunakan dropdown **Mode obrolan**. Di layar lebih lebar, gunakan tab mode. Riwayat obrolan berada dalam sesi yang sama saat berpindah mode.

| Mode | Digunakan untuk |
|---|---|
| Obrolan bebas | Bercerita dan menata pikiran tanpa format khusus |
| Check-in | Mengamati suasana hati dan kebutuhan saat ini |
| Catatan pikiran | Memisahkan situasi, pikiran, dan perasaan |
| Nilai dan arah | Merefleksikan hal penting dan langkah kecil berikutnya |
| Latihan | Mengikuti grounding atau pernapasan yang tersedia |
| Ringkasan | Meminta rangkuman dari percakapan terbaru |

Latihan memiliki langkah statis dan bukan diagnosis. Hentikan latihan jika membuat tidak nyaman; tidak harus menyelesaikannya.

## Mengirim pesan

- Ketik di kotak pesan, kemudian tekan tombol kirim.
- Di komputer: Enter mengirim; Shift+Enter membuat baris baru.
- Di HP: gunakan tombol kirim. Petunjuk shortcut keyboard memang disembunyikan pada perangkat sentuh.
- Batas input adalah 1.000 karakter per pesan. Pisahkan cerita panjang menjadi beberapa pesan.
- Saat balasan diproses, tunggu sampai indikator selesai; jangan mengirim berulang kali.
- Jika muncul kegagalan yang bisa dicoba ulang, tekan **Coba lagi** setelah koneksi/layanan pulih.

AI tidak mengingat seluruh percakapan tanpa batas. Permintaan memakai potongan riwayat terbaru, dan ringkasan memakai sampai 14 pesan terakhir ditambah permintaan ringkasan. Berikan konteks singkat lagi bila pembicaraan sudah panjang.

## Memberi umpan balik

Tombol **Membantu** dan **Kurang pas** memberi penilaian terhadap jawaban. Kode mengirim label dan mode, bukan isi curhat.

Umpan balik saat ini hanya penghitung sementara pada proses server. Ini bukan sistem tiket, tidak menjamin dibaca petugas, dan tidak otomatis melatih model. Penghitung dapat hilang saat proses restart atau berbeda antar-instance Vercel.

## Ringkasan, salin, dan unduh

1. Pilih **Ringkasan** setelah ada percakapan.
2. Tekan **Buat ringkasan**, lalu tunggu hasilnya.
3. Gunakan **Salin ringkasan** atau **Unduh ringkasan** bila ingin menyimpan sendiri.

File unduhan bernama `ringkasan-kawan-pendengar.txt`. Isinya rangkuman, bukan seluruh transkrip. Ringkasan yang belum disimpan dapat hilang saat halaman dimuat ulang.

Unduhan dan teks yang sudah disalin berada di perangkat/clipboard pengguna. Mengakhiri sesi tidak menghapus salinan tersebut. Perlakukan ringkasan sebagai data pribadi.

## Mengakhiri sesi dan privasi

Tekan **Akhiri sesi**, lalu konfirmasi **Hapus sesi**. Tindakan ini menghapus profil dan riwayat yang dikelola aplikasi pada tab tersebut, lalu kembali ke halaman depan. Pilih Batal jika belum ingin menghapus.

Riwayat memakai `sessionStorage`, bukan database akun. Memuat ulang tab biasanya masih mempertahankan sesi. Menutup tab umumnya mengakhiri penyimpanan sesi, tetapi beberapa browser dapat memulihkan tab/sesi; gunakan tombol Hapus sesi untuk membersihkan data aplikasi secara eksplisit, terutama di komputer bersama.

Penghapusan lokal tidak berarti data di 9Router, penyedia AI, hosting, clipboard, atau file unduhan ikut terhapus. Jangan memasukkan nama lengkap, alamat, nomor rekening, password, API key, atau data sensitif yang tidak diperlukan. Kebijakan pemrosesan pihak ketiga perlu ditinjau oleh pengelola.

## Bantuan darurat

Pada layar kecil, tombol header bertuliskan **Darurat**; nama aksesibelnya tetap **Bantuan darurat**. Tombol tersebut membuka pilihan layanan, tidak otomatis menghubungi petugas dan tidak membuat laporan.

- Pilih nomor untuk membuka aplikasi telepon jika perangkat mendukungnya; panggilan tetap perlu dikonfirmasi pengguna.
- Halaman **Bantuan** juga memuat kontak dan latihan statis.
- Jika AI sedang gagal, jangan menunggu balasannya untuk mencari bantuan nyata.
- Aplikasi bukan psikolog, dokter, alat diagnosis, atau layanan respons darurat. Pada bahaya langsung, cari bantuan darurat setempat dan orang tepercaya yang bisa mendampingi.

Jangan menelepon nomor darurat hanya untuk menguji tombol. Pengelola cukup memeriksa tautan telepon dan teksnya saat pengujian.

## Tema dan navigasi

Gunakan tombol tema di header untuk berpindah terang/gelap. Tema mengikuti sistem bila belum dipilih dan pilihan disimpan untuk sesi browser. Menu **Ruang obrolan**, **Bantuan**, dan **Privasi** ada di header; membuka chat tanpa profil akan mengarahkan pengguna untuk memulai dari halaman depan.

Jika tombol tidak terlihat di HP, gulir halaman dan pastikan tidak sedang memakai versi cache lama. UI responsif terbaru hanya terlihat di website publik setelah dipublikasikan dari versi lokal.
