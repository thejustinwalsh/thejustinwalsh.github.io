import type { SearchEntry } from "./search-types";

export type DisplayEntry = SearchEntry & { stale?: boolean };

export function entryKey(e: SearchEntry): string {
  return `${e.collection}:${e.id}`;
}

/**
 * Merge fresh results into the currently visible list without reflow.
 * - Items still in fresh: updated in-place, stay in their current position
 * - Items gone from fresh: marked stale (disabled), stay in place
 * - New items from fresh: appended at the end
 */
export function mergeResults(
  current: DisplayEntry[],
  fresh: SearchEntry[],
): DisplayEntry[] {
  const freshMap = new Map(fresh.map((e) => [entryKey(e), e]));
  const currentKeys = new Set(current.map((e) => entryKey(e)));

  // Walk existing items: update in-place or mark stale
  const merged: DisplayEntry[] = current.map((e) => {
    const key = entryKey(e);
    const updated = freshMap.get(key);
    if (updated) return { ...updated, stale: false };
    return { ...e, stale: true };
  });

  // Append new items not already visible
  for (const e of fresh) {
    if (!currentKeys.has(entryKey(e))) {
      merged.push({ ...e, stale: false });
    }
  }

  return merged;
}
