import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
