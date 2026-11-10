import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>
          Kawan Pendengar adalah pendamping refleksi berbasis AI untuk orang dewasa dan remaja di
          Indonesia. Bukan psikolog, bukan dokter, dan bukan layanan darurat. Pesanmu diproses
          penyedia AI pihak ketiga dan tidak disimpan di server kami.
        </p>
        <nav className="footer-links" aria-label="Tautan kaki halaman">
          <Link href="/bantuan">Bantuan darurat</Link>
          <Link href="/privasi">Kebijakan privasi</Link>
          <Link href="/chat">Ruang obrolan</Link>
        </nav>
      </div>
    </footer>
  );
}
