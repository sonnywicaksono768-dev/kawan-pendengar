"use client";

import { useId, useRef } from "react";
import { Icon } from "@/components/Icon";
import { MAX_CONTENT } from "@/lib/validate";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
  disabled?: boolean;
  placeholder?: string;
  crisisMode?: boolean;
};

export function MessageInput({
  value,
  onChange,
  onSubmit,
  sending,
  disabled = false,
  placeholder = "Tulis apa yang sedang kamu rasakan",
  crisisMode = false,
}: MessageInputProps) {
  const id = "chat-input";
  const hintId = useId();
  const counterId = useId();
  const over = value.length > MAX_CONTENT;
  const empty = value.trim().length === 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!empty && !over && !sending && !disabled) onSubmit();
    }
  }

  return (
    <form
      className="composer-inner"
      onSubmit={(event) => {
        event.preventDefault();
        if (!empty && !over && !sending && !disabled) onSubmit();
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Pesanmu
      </label>
      <div className="composer-row">
        <textarea
          id={id}
          ref={textareaRef}
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={MAX_CONTENT + 200}
          rows={2}
          aria-describedby={`${hintId} ${counterId}`}
          aria-invalid={over}
          disabled={disabled}
          autoComplete="off"
          spellCheck
        />
        <button
          type="submit"
          className="btn btn-primary send-btn"
          disabled={sending || disabled || empty || over}
          aria-busy={sending}
        >
          <Icon name={sending ? "spinner" : "send"} className={sending ? "spinner" : undefined} />
          <span className="sr-only">{sending ? "Mengirim pesan" : "Kirim pesan"}</span>
        </button>
      </div>

      <div className="composer-meta">
        <span id={hintId} className={crisisMode ? undefined : "keyboard-hint"}>
          {crisisMode
            ? "Aku tetap di sini. Kalau kamu merasa tidak aman, hubungi bantuan darurat."
            : "Enter untuk kirim, Shift dan Enter untuk baris baru."}
        </span>
        <span id={counterId} className="counter" data-over={over}>
          {value.length}/{MAX_CONTENT}
        </span>
      </div>
    </form>
  );
}
