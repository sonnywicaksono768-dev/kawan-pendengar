"use client";

import { forwardRef } from "react";
import { HOTLINES, hotlineLabel } from "@/data/hotlines";
import { TypingIndicator } from "@/components/TypingIndicator";
import type { StoredMessage } from "@/lib/session";

type Rating = "helpful" | "not_helpful";

type ChatWindowProps = {
  messages: StoredMessage[];
  nickname: string;
  feedback: Record<string, Rating>;
  onFeedback: (messageId: string, rating: Rating) => void;
  sending: boolean;
};

export const ChatWindow = forwardRef<HTMLDivElement, ChatWindowProps>(function ChatWindow(
  { messages, nickname, feedback, onFeedback, sending },
  ref,
) {
  return (
    <div
      className="chat-log"
      ref={ref}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Percakapan"
    >
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const id = `${message.role}-${index}`;
        const rating = feedback[id];

        return (
          <article
            key={id}
            className={`msg ${isUser ? "msg-user" : "msg-ai"} ${message.crisis ? "msg-crisis" : ""}`}
          >
            <span className="msg-label">{isUser ? nickname : "Kawan Pendengar"}</span>
            <div className="bubble">
              {message.content}
              {message.crisis && (
                <ul className="crisis-links">
                  {HOTLINES.map((hotline) => (
                    <li key={hotline.id}>
                      <a href={`tel:${hotline.phone}`}>{hotlineLabel(hotline)}</a>
                      <span>{hotline.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isUser && (
              <div className="msg-feedback">
                {rating ? (
                  <span className="thanks">
                    {rating === "helpful"
                      ? "Terima kasih, catatanmu tersimpan tanpa isi percakapan."
                      : "Terima kasih, aku akan lebih hati-hati."}
                  </span>
                ) : (
                  <>
                    <span className="sr-only">Apakah balasan ini membantu?</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onFeedback(id, "helpful")}
                    >
                      Membantu
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onFeedback(id, "not_helpful")}
                    >
                      Kurang pas
                    </button>
                  </>
                )}
              </div>
            )}
          </article>
        );
      })}

      {sending && <TypingIndicator />}
    </div>
  );
});
