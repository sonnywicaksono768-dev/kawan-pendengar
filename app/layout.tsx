import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted so the build never fetches Google Fonts at build time (Vercel's
// build egress to fonts.googleapis.com fails and crashes next/font/google).
const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  display: "swap",
  weight: "400 700",
  variable: "--font-jakarta",
});

const fraunces = localFont({
  src: "./fonts/fraunces-latin.woff2",
  display: "swap",
  weight: "400 600",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Kawan Pendengar, pendamping refleksi diri",
    template: "%s | Kawan Pendengar",
  },
  description:
    "Ruang bercerita berbasis AI untuk menamai perasaan dan menemukan langkah kecil. Bukan pengganti psikolog atau layanan darurat.",
  applicationName: "Kawan Pendengar",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#101514" },
  ],
};

const THEME_BOOT = `try{var t=sessionStorage.getItem("kawan-pendengar.theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <a className="skip-link" href="#konten">
          Lompat ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
