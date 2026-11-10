import { SiteHeader } from "@/components/SiteHeader";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="konten">{children}</main>
    </>
  );
}
