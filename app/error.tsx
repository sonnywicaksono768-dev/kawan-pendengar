"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main id="konten" className="page">
        <div className="wrap">
          <div className="panel" style={{ maxWidth: "34rem" }}>
            <h2>Ada yang tidak berjalan semestinya</h2>
            <p>
              Bagian ini gagal dimuat. Coba muat ulang. Kalau kamu sedang membutuhkan bantuan
              segera, halaman bantuan tetap bisa dibuka dan tidak bergantung pada layanan AI.
            </p>
            <div className="summary-actions">
              <button type="button" className="btn btn-primary" onClick={reset}>
                Muat ulang halaman
              </button>
              <Link className="btn btn-secondary" href="/bantuan">
                Buka kontak bantuan
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
