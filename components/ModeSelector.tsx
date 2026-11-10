"use client";

import { useId, useRef } from "react";
import type { ChatMode } from "@/lib/validate";

const MODES: Array<{ value: ChatMode; label: string }> = [
  { value: "free_chat", label: "Obrolan bebas" },
  { value: "mood_checkin", label: "Check-in" },
  { value: "thought_record", label: "Catatan pikiran" },
  { value: "values_explore", label: "Nilai dan arah" },
  { value: "grounding", label: "Latihan" },
  { value: "summary", label: "Ringkasan" },
];

type ModeSelectorProps = {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
  disabled?: boolean;
};

export function ModeSelector({ mode, onChange, disabled = false }: ModeSelectorProps) {
  const selectId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = MODES.length - 1;
    let next = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    onChange(MODES[next].value);
    refs.current[next]?.focus();
  }

  return (
    <>
      <div className="mode-picker">
        <label className="field-label" htmlFor={selectId}>Mode obrolan</label>
        <select
          id={selectId}
          className="input"
          value={mode}
          onChange={(event) => onChange(event.target.value as ChatMode)}
          aria-controls="chat-panel"
          disabled={disabled}
        >
          {MODES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
      <div className="mode-tabs" role="tablist" aria-label="Mode obrolan">
        {MODES.map((item, index) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={`mode-tab-${item.value}`}
            aria-selected={mode === item.value}
            aria-controls="chat-panel"
            tabIndex={mode === item.value ? 0 : -1}
            ref={(element) => {
              refs.current[index] = element;
            }}
            className="mode-tab"
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            disabled={disabled}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
