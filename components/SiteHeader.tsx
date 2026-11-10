"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SosButton } from "@/components/SosButton";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/chat", label: "Ruang obrolan" },
  { href: "/bantuan", label: "Bantuan" },
  { href: "/privasi", label: "Privasi" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true" />
          Kawan Pendengar
        </Link>

        <nav className="site-nav" aria-label="Navigasi utama">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <SosButton compact />
        </div>
      </div>
    </header>
  );
}
