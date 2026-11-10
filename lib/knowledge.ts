import knowledge from "@/data/knowledge.json";

type KnowledgeEntry = {
  id: string;
  tags: string[];
  title: string;
  content: string;
};

const ENTRIES = knowledge as KnowledgeEntry[];

/**
 * Lightweight selection: score entries by tag and title overlap with the last
 * user messages. No vector database, per blueprint section 15.3.
 */
export function selectKnowledge(
  userText: string,
  limit = 2,
): Array<{ title: string; content: string }> {
  const text = userText.toLowerCase();
  const scored = ENTRIES.map((entry) => {
    let score = 0;
    for (const tag of entry.tags) {
      if (text.includes(tag.toLowerCase())) score += 3;
    }
    for (const word of entry.title.toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length > 3 && text.includes(word)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      title: item.entry.title,
      content: item.entry.content,
    }));
}

export function allKnowledgeIds(): string[] {
  return ENTRIES.map((entry) => entry.id);
}
