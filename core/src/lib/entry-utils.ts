export type EntryPayload = {
  id?: string;
  label?: string;
  norm?: string;
  url?: string;
};

export function dedupeEntryPayloads(entries: EntryPayload[]): EntryPayload[] {
  const seen = new Set<string>();
  const result: EntryPayload[] = [];

  for (const entry of entries) {
    const key = entry.url ?? entry.norm ?? entry.label;
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(entry);
  }

  return result;
}

