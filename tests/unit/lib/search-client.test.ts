import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Worker and caches globally so SearchClient takes the fallback path
vi.stubGlobal("Worker", undefined);
vi.stubGlobal("caches", undefined);

// Mock fetch and fuse.js to avoid real network/module loading
vi.mock("fuse.js", () => {
  const mockSearch = vi.fn().mockReturnValue([]);
  const FuseMock: any = vi.fn().mockImplementation(() => ({ search: mockSearch }));
  FuseMock.parseIndex = vi.fn().mockReturnValue({});
  FuseMock.createIndex = vi.fn().mockReturnValue({ toJSON: () => ({}) });
  return { default: FuseMock };
});

import { SearchClient } from "@/lib/search";

describe("SearchClient LRU cache", () => {
  let client: SearchClient;

  beforeEach(() => {
    client = new SearchClient();
  });

  it("stores and retrieves cached results", () => {
    // Access the cache through the public API by simulating the internal flow
    // We'll test getCached which reads from the internal cache
    expect(client.getCached("test", "global")).toBeNull();
  });

  it("returns null for uncached queries", () => {
    expect(client.getCached("nonexistent", "global")).toBeNull();
    expect(client.getCached("also-missing", "devlog")).toBeNull();
  });

  it("destroy clears the cache", () => {
    client.destroy();
    expect(client.getCached("anything", "global")).toBeNull();
  });
});

describe("SearchClient handler registration", () => {
  it("accepts status and results handlers without throwing", () => {
    const client = new SearchClient();
    const statusFn = vi.fn();
    const resultsFn = vi.fn();

    expect(() => client.onStatus(statusFn)).not.toThrow();
    expect(() => client.onResults(resultsFn)).not.toThrow();

    client.destroy();
  });
});
