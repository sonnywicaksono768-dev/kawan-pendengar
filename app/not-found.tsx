import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="konten" className="page">
        <div className="wrap">
          <div className="panel" style={{ maxWidth: "34rem" }}>
            <h2>Halaman ini tidak ditemukan</h2>
            <p>
              Mungkin tautannya berubah atau sudah tidak dipakai. Kamu bisa kembali ke halaman
              depan, membuka ruang obrolan, atau langsung melihat kontak bantuan.
            </p>
            <div className="summary-actions">
              <Link className="btn btn-primary" href="/">
                Buka halaman depan
              </Link>
              <Link className="btn btn-secondary" href="/bantuan">
                Lihat kontak bantuan
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
