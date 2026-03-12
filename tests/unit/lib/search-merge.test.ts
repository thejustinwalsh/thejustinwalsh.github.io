import { describe, it, expect } from "vitest";
import { mergeResults, entryKey, type DisplayEntry } from "@/lib/search-merge";
import type { SearchEntry } from "@/lib/search-types";

function entry(
  id: string,
  collection: SearchEntry["collection"] = "devlog",
  overrides: Partial<SearchEntry> = {},
): SearchEntry {
  return {
    collection,
    id,
    title: `Title ${id}`,
    description: `Desc ${id}`,
    tags: [],
    keywords: "",
    href: `/${collection}/${id}`,
    ...overrides,
  };
}

describe("entryKey", () => {
  it("combines collection and id", () => {
    expect(entryKey(entry("foo", "devlog"))).toBe("devlog:foo");
    expect(entryKey(entry("bar", "projects"))).toBe("projects:bar");
  });
});

describe("mergeResults", () => {
  it("returns fresh items directly when current is empty", () => {
    const fresh = [entry("a"), entry("b")];
    const result = mergeResults([], fresh);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
    expect(result[1].id).toBe("b");
    expect(result.every((r) => r.stale === false)).toBe(true);
  });

  it("updates items in-place when they exist in both", () => {
    const current: DisplayEntry[] = [
      { ...entry("a", "devlog", { title: "Old Title" }), stale: false },
      { ...entry("b"), stale: false },
    ];
    const fresh = [
      entry("a", "devlog", { title: "New Title" }),
      entry("b"),
    ];

    const result = mergeResults(current, fresh);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("New Title");
    expect(result[0].stale).toBe(false);
    expect(result[1].id).toBe("b");
  });

  it("marks removed items as stale instead of removing them", () => {
    const current: DisplayEntry[] = [
      { ...entry("a"), stale: false },
      { ...entry("b"), stale: false },
      { ...entry("c"), stale: false },
    ];
    const fresh = [entry("a"), entry("c")];

    const result = mergeResults(current, fresh);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ id: "a", stale: false });
    expect(result[1]).toMatchObject({ id: "b", stale: true });
    expect(result[2]).toMatchObject({ id: "c", stale: false });
  });

  it("appends new items at the end", () => {
    const current: DisplayEntry[] = [
      { ...entry("a"), stale: false },
      { ...entry("b"), stale: false },
    ];
    const fresh = [entry("a"), entry("b"), entry("c"), entry("d")];

    const result = mergeResults(current, fresh);

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe("a");
    expect(result[1].id).toBe("b");
    expect(result[2].id).toBe("c");
    expect(result[3].id).toBe("d");
    expect(result.every((r) => r.stale === false)).toBe(true);
  });

  it("handles mixed: update, stale, and append simultaneously", () => {
    const current: DisplayEntry[] = [
      { ...entry("a", "devlog", { title: "Old A" }), stale: false },
      { ...entry("b"), stale: false },
      { ...entry("c"), stale: false },
    ];
    // a updated, b removed, c stays, d is new
    const fresh = [
      entry("a", "devlog", { title: "New A" }),
      entry("c"),
      entry("d"),
    ];

    const result = mergeResults(current, fresh);

    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ id: "a", title: "New A", stale: false });
    expect(result[1]).toMatchObject({ id: "b", stale: true });
    expect(result[2]).toMatchObject({ id: "c", stale: false });
    expect(result[3]).toMatchObject({ id: "d", stale: false });
  });

  it("marks all items stale when fresh is empty", () => {
    const current: DisplayEntry[] = [
      { ...entry("a"), stale: false },
      { ...entry("b"), stale: false },
    ];

    const result = mergeResults(current, []);

    expect(result).toHaveLength(2);
    expect(result.every((r) => r.stale === true)).toBe(true);
  });

  it("preserves order of current items regardless of fresh order", () => {
    const current: DisplayEntry[] = [
      { ...entry("c"), stale: false },
      { ...entry("a"), stale: false },
      { ...entry("b"), stale: false },
    ];
    // fresh has different ordering — should not reorder current
    const fresh = [entry("a"), entry("b"), entry("c")];

    const result = mergeResults(current, fresh);

    expect(result[0].id).toBe("c");
    expect(result[1].id).toBe("a");
    expect(result[2].id).toBe("b");
  });

  it("handles already-stale items becoming active again", () => {
    const current: DisplayEntry[] = [
      { ...entry("a"), stale: true },
      { ...entry("b"), stale: false },
    ];
    const fresh = [entry("a"), entry("b")];

    const result = mergeResults(current, fresh);

    expect(result[0]).toMatchObject({ id: "a", stale: false });
    expect(result[1]).toMatchObject({ id: "b", stale: false });
  });

  it("handles cross-collection entries with same id", () => {
    const current: DisplayEntry[] = [
      { ...entry("foo", "devlog"), stale: false },
      { ...entry("foo", "projects"), stale: false },
    ];
    const fresh = [entry("foo", "devlog")];

    const result = mergeResults(current, fresh);

    expect(result[0]).toMatchObject({ id: "foo", collection: "devlog", stale: false });
    expect(result[1]).toMatchObject({ id: "foo", collection: "projects", stale: true });
  });
});
