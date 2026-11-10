"use client";

import type { ChatMessage } from "@/lib/validate";

/**
 * Session helpers. Everything lives in sessionStorage and disappears when the
 * tab closes. No localStorage, no cookies (blueprint 8.5).
 */
const SESSION_KEY = "kawan-pendengar.session.v1";
const PROFILE_KEY = "kawan-pendengar.profile.v1";

export type StoredMessage = ChatMessage & { crisis?: boolean };

export type SessionState = {
  nickname: string;
  mode: string;
  messages: StoredMessage[];
  crisisMode: boolean;
};

export type Profile = {
  nickname: string;
  ageGroup: "under18" | "adult";
  consentAt: string;
};

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked. Losing history is acceptable; crashing is not.
  }
}

export function loadSession(): SessionState | null {
  return read<SessionState>(SESSION_KEY);
}

export function saveSession(state: SessionState): void {
  write(SESSION_KEY, state);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function loadProfile(): Profile | null {
  return read<Profile>(PROFILE_KEY);
}

export function saveProfile(profile: Profile): void {
  write(PROFILE_KEY, profile);
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROFILE_KEY);
}

/** The server receives at most the last 15 messages. */
export function trimForServer(messages: ChatMessage[], limit = 15): ChatMessage[] {
  return messages.slice(-limit);
}

export function formatTranscript(nickname: string, messages: ChatMessage[]): string {
  const header = `Ringkasan sesi Kawan Pendengar${nickname ? ` untuk ${nickname}` : ""}\n`;
  const body = messages
    .map((message) => `${message.role === "user" ? "Kamu" : "Kawan Pendengar"}: ${message.content}`)
    .join("\n\n");
  return `${header}\n${body}\n\nSesi ini disalin oleh pengguna. Tidak disimpan di server.\n`;
}
