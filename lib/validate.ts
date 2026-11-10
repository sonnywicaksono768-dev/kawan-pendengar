export const CHAT_MODES = [
  "free_chat",
  "mood_checkin",
  "thought_record",
  "values_explore",
  "grounding",
  "summary",
] as const;

export type ChatMode = (typeof CHAT_MODES)[number];
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatPayload = {
  mode: ChatMode;
  messages: ChatMessage[];
};

export const MAX_MESSAGES = 15;
export const MAX_CONTENT = 1000;

export type ValidationResult =
  | { ok: true; data: ChatPayload }
  | { ok: false; reason: string };

function isMode(value: unknown): value is ChatMode {
  return typeof value === "string" && (CHAT_MODES as readonly string[]).includes(value);
}

/** Removes control characters and collapses whitespace. Never trusts the client. */
export function cleanContent(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateChatPayload(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, reason: "payload_not_object" };
  }

  const body = input as Record<string, unknown>;

  if (!isMode(body.mode)) {
    return { ok: false, reason: "unknown_mode" };
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length < 1 || rawMessages.length > MAX_MESSAGES) {
    return { ok: false, reason: "message_count" };
  }

  const messages: ChatMessage[] = [];
  for (const entry of rawMessages) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, reason: "message_shape" };
    }
    const message = entry as Record<string, unknown>;
    if (message.role !== "user" && message.role !== "assistant") {
      return { ok: false, reason: "forbidden_role" };
    }
    if (typeof message.content !== "string") {
      return { ok: false, reason: "content_type" };
    }
    const content = cleanContent(message.content);
    if (content.length === 0 || content.length > MAX_CONTENT) {
      return { ok: false, reason: "content_length" };
    }
    messages.push({ role: message.role, content });
  }

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return { ok: false, reason: "last_message_not_user" };
  }

  return { ok: true, data: { mode: body.mode, messages } };
}

/** Client-side helper for the character counter and input guard. */
export function clientContentIsValid(value: string): boolean {
  const cleaned = cleanContent(value);
  return cleaned.length > 0 && cleaned.length <= MAX_CONTENT;
}
