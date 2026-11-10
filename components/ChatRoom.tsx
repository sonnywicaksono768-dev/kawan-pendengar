"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { ErrorBanner } from "@/components/ErrorBanner";
import { GroundingExercise } from "@/components/GroundingExercise";
import { Icon } from "@/components/Icon";
import { MessageInput } from "@/components/MessageInput";
import { ModeSelector } from "@/components/ModeSelector";
import {
  clearProfile,
  clearSession,
  loadProfile,
  loadSession,
  saveSession,
  trimForServer,
  type Profile,
  type StoredMessage,
} from "@/lib/session";
import { CHAT_MODES, MAX_CONTENT, type ChatMode } from "@/lib/validate";

type ChatApiResponse =
  | { type: "reply"; message: string; crisisMode: boolean }
  | { type: "crisis"; message: string; crisisMode: true; hotlines: unknown }
  | { type: "error"; message: string; retryable: boolean };

type Rating = "helpful" | "not_helpful";

const FALLBACK_ERROR = "Maaf, aku butuh waktu sejenak untuk berpikir. Bisa ulangi pesannya?";
const TIMEOUT_ERROR = "Koneksimu sepertinya terputus. Coba lagi ya.";

const SUGGESTIONS = [
  { text: "Aku capek banget akhir-akhir ini", hint: "Mulai dari rasa lelah" },
  { text: "Ada yang mengganggu pikiranku", hint: "Ceritakan yang paling berat" },
  { text: "Aku cuma butuh didengar hari ini", hint: "Tidak perlu solusi dulu" },
];

const PLACEHOLDER: Partial<Record<ChatMode, string>> = {
  free_chat: "Tulis apa yang sedang kamu rasakan",
  mood_checkin: "Hari ini kamu merasa apa?",
  thought_record: "Situasi apa yang sedang mengganggu?",
  values_explore: "Kapan terakhir kamu merasa hidup?",
};

export function ChatRoom() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>("free_chat");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisMode, setCrisisMode] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, Rating>>({});
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const messagesRef = useRef<StoredMessage[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedProfile = loadProfile();
    const storedSession = loadSession();
    setProfile(storedProfile);

    if (storedSession) {
      const stored = storedSession.messages.filter(
        (message) => message.role === "user" || message.role === "assistant",
      );
      messagesRef.current = stored;
      setMessages(stored);
      setMode(
        (CHAT_MODES as readonly string[]).includes(storedSession.mode)
          ? (storedSession.mode as ChatMode)
          : "free_chat",
      );
      setCrisisMode(Boolean(storedSession.crisisMode));
    } else {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("mode");
      if (requested && (CHAT_MODES as readonly string[]).includes(requested)) {
        setMode(requested as ChatMode);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !profile) return;
    saveSession({
      nickname: profile.nickname,
      mode,
      messages,
      crisisMode,
    });
  }, [ready, profile, mode, messages, crisisMode]);

  useEffect(() => {
    const element = logRef.current?.lastElementChild;
    if (!element) return;
    element.scrollIntoView({ block: "nearest" });
  }, [messages, sending]);

  const postChat = useCallback(
    async (payloadMessages: StoredMessage[], requestMode: ChatMode): Promise<ChatApiResponse | null> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 40000);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: requestMode,
            messages: trimForServer(payloadMessages).map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => null)) as ChatApiResponse | null;
        if (!response.ok || !data || data.type === "error") {
          setError(data && data.type === "error" ? data.message : FALLBACK_ERROR);
          return null;
        }
        return data;
      } catch {
        setError(controller.signal.aborted ? FALLBACK_ERROR : TIMEOUT_ERROR);
        return null;
      } finally {
        clearTimeout(timer);
      }
    },
    [],
  );

  const applyResponse = useCallback((base: StoredMessage[], data: ChatApiResponse) => {
    if (data.type !== "reply" && data.type !== "crisis") return;
    const reply: StoredMessage = {
      role: "assistant",
      content: data.message,
      ...(data.type === "crisis" ? { crisis: true } : {}),
    };
    const next = [...base, reply];
    messagesRef.current = next;
    setMessages(next);
    if (data.type === "crisis" || data.crisisMode) setCrisisMode(true);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending) return;

      const base = messagesRef.current;
      const next = [...base, { role: "user" as const, content: text.slice(0, MAX_CONTENT) }];
      messagesRef.current = next;
      setMessages(next);
      setInput("");
      setError(null);
      setSummary(null);
      setSending(true);

      const data = await postChat(next, mode);
      if (data) applyResponse(next, data);
      setSending(false);
    },
    [applyResponse, mode, postChat, sending],
  );

  async function retry() {
    if (sending) return;
    const current = messagesRef.current;
    if (current.length === 0 || current[current.length - 1].role !== "user") return;

    setError(null);
    setSending(true);
    const data = await postChat(current, mode);
    if (data) applyResponse(current, data);
    setSending(false);
  }

  async function createSummary() {
    if (sending) return;
    const base = messagesRef.current;
    if (base.length === 0) {
      setError("Belum ada obrolan yang bisa diringkas. Mulai bercerita dulu, ya.");
      return;
    }

    setSending(true);
    setError(null);
    setSummary(null);

    const payload: StoredMessage[] = [
      ...base.slice(-14),
      {
        role: "user",
        content:
          "Tolong buat ringkasan sesi ini dalam 5 sampai 8 kalimat pendek, tanpa diagnosis dan tanpa janji hasil.",
      },
    ];

    const data = await postChat(payload, "summary");
    if (data?.type === "reply") setSummary(data.message);
    if (data?.type === "crisis") {
      applyResponse(base, data);
      setMode("free_chat");
    }
    setSending(false);
  }

  async function handleFeedback(key: string, rating: Rating) {
    setFeedback((previous) => ({ ...previous, [key]: rating }));
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, mode }),
      });
    } catch {
      // The label is a soft signal. A failed post should never interrupt the user.
    }
  }

  async function copySummary() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Tidak bisa menyalin otomatis. Blok teksnya lalu salin manual, ya.");
    }
  }

  function downloadSummary() {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ringkasan-kawan-pendengar.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function endSession() {
    clearSession();
    clearProfile();
    router.push("/");
  }

  function changeMode(next: ChatMode) {
    setMode(next);
    setError(null);
    if (next !== "summary") setSummary(null);
  }

  function pickSuggestion(text: string) {
    setInput(text);
    requestAnimationFrame(() => document.getElementById("chat-input")?.focus());
  }

  if (!ready) {
    return (
      <div className="chat-shell">
        <div className="wrap chat-main">
          <p className="notice" role="status">
            Menyiapkan ruang obrolan...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="chat-shell">
        <div className="wrap chat-main">
          <div className="panel">
            <h2>Isi nama samaran dulu, ya</h2>
            <p>
              Persetujuan dan nama samaran dibutuhkan sebelum kamu bisa bercerita di sini. Tidak
              ada email atau kata sandi.
            </p>
            <Link className="btn btn-primary" href="/">
              Kembali ke halaman depan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-shell">
      <div className="chat-top">
        <div className="wrap chat-top-inner">
          <div className="chat-identity">
            <h1 className="chat-title">Ruang obrolan</h1>
            <span className="chat-note">Kamu sedang berbicara dengan AI.</span>
            {crisisMode && <span className="chat-note">Mode hati-hati aktif</span>}
          </div>

          <div className="chat-tools">
            <ModeSelector mode={mode} onChange={changeMode} disabled={sending} />
            <div className="session-tools">
              {confirmEnd ? (
                <div className="confirm-row">
                  <span>Hapus seluruh sesi di tab ini?</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={endSession}>
                    Hapus sesi
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmEnd(false)}
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setConfirmEnd(true)}
                >
                  <Icon name="log-out" />
                  Akhiri sesi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="wrap chat-main"
        id="chat-panel"
        role="tabpanel"
        aria-labelledby={`mode-tab-${mode}`}
      >
        {error && <ErrorBanner message={error} onRetry={retry} onDismiss={() => setError(null)} />}

        {mode === "grounding" ? (
          <GroundingExercise onBack={() => changeMode("free_chat")} />
        ) : (
          <>
            {mode === "summary" && summary && (
              <section className="panel summary-card" aria-labelledby="ringkasan-judul">
                <h2 id="ringkasan-judul">Ringkasan sesi</h2>
                <p className="field-hint">
                  Ringkasan ini hanya ada di tab ini. Salin atau unduh sebelum menutup tab.
                </p>
                <div className="summary-text">{summary}</div>
                <div className="summary-actions">
                  <button type="button" className="btn btn-secondary" onClick={copySummary}>
                    <Icon name={copied ? "check" : "copy"} />
                    {copied ? "Tersalin" : "Salin ringkasan"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={downloadSummary}>
                    <Icon name="download" />
                    Unduh ringkasan
                  </button>
                </div>
              </section>
            )}

            {messages.length === 0 && !sending ? (
              <div className="empty-state">
                <h2>Halo, {profile.nickname}. Mau mulai dari mana?</h2>
                <p>
                  Tidak ada jawaban yang benar di sini. Kamu bisa mulai dari satu kalimat, atau
                  pilih salah satu pembuka di bawah.
                </p>
                <div className="suggestions">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.text}
                      type="button"
                      className="suggestion"
                      onClick={() => pickSuggestion(suggestion.text)}
                    >
                      <span>{suggestion.text}</span>
                      <small>{suggestion.hint}</small>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ChatWindow
                ref={logRef}
                messages={messages}
                nickname={profile.nickname}
                feedback={feedback}
                onFeedback={handleFeedback}
                sending={sending}
              />
            )}
          </>
        )}
      </div>

      {mode !== "grounding" && (
        <div className="composer">
          {mode === "summary" ? (
            <div className="composer-inner">
              <div className="composer-meta">
                <span>Ringkasan dibuat dari obrolan di tab ini dan tidak disimpan di server.</span>
              </div>
              <div className="summary-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={createSummary}
                  disabled={sending}
                  aria-busy={sending}
                >
                  {sending ? "Menyusun ringkasan..." : "Buat ringkasan"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => changeMode("free_chat")}
                >
                  Kembali ke obrolan
                </button>
              </div>
            </div>
          ) : (
            <MessageInput
              value={input}
              onChange={setInput}
              onSubmit={() => send(input)}
              sending={sending}
              placeholder={PLACEHOLDER[mode] ?? "Tulis pesanmu"}
              crisisMode={crisisMode}
            />
          )}
        </div>
      )}
    </div>
  );
}
