import type { Metadata } from "next";
import { ChatRoom } from "@/components/ChatRoom";

export const metadata: Metadata = {
  title: "Ruang obrolan",
  description: "Ruang bercerita anonim bersama Kawan Pendengar.",
};

export default function ChatPage() {
  return <ChatRoom />;
}
