import Fuse from "fuse.js";
import type {
  SearchEntry,
  SearchManifest,
} from "./search-types";
import {
  COLLECTIONS,
  FUSE_KEYS,
  FUSE_OPTIONS,
} from "./search-types";

const CACHE_NAME = "tjw-search-v1";
const MANIFEST_URL = "/search/manifest.json";
const FUSE_INDEX_URL = "/search/_fuse-index";

let fuse: Fuse<SearchEntry> | null = null;
let allEntries: SearchEntry[] = [];

function signal(state: string, entryCount = allEntries.length) {
  self.postMessage({ type: "status", state, entryCount });
}

async function getCache(): Promise<Cache> {
  return caches.open(CACHE_NAME);
}

async function cachedJSON<T>(cache: Cache, url: string): Promise<T | null> {
  const res = await cache.match(url);
  if (!res) return null;
  return res.json() as Promise<T>;
}

async function storeJSON(cache: Cache, url: string, data: unknown): Promise<void> {
  await cache.put(
    url,
    new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function chunkUrl(name: string): string {
  return `/search/${name}.json`;
}

/**
 * Build Fuse from entries. Tries to restore a cached Fuse index first
 * (parseIndex is cheaper than createIndex). If none exists, builds fresh
 * and caches the serialized index for next time.
 */
async function buildFuse(entries: SearchEntry[], cache: Cache): Promise<void> {
  allEntries = entries;

  // Try cached Fuse index
  const cachedIndex = await cachedJSON<{ keys: any; records: any }>(cache, FUSE_INDEX_URL);
  if (cachedIndex) {
    try {
      const index = Fuse.parseIndex<SearchEntry>(cachedIndex);
      fuse = new Fuse(entries, { ...FUSE_OPTIONS }, index);
      return;
    } catch {
      // Cached index is corrupt or incompatible — rebuild
    }
  }

  // Build fresh
  const index = Fuse.createIndex(FUSE_KEYS, entries);
  fuse = new Fuse(entries, { ...FUSE_OPTIONS }, index);

  // Cache the serialized index for next load
  await storeJSON(cache, FUSE_INDEX_URL, index.toJSON()).catch(() => {});
}

async function loadChunksFromCache(cache: Cache): Promise<SearchEntry[]> {
  const chunks = await Promise.all(
    COLLECTIONS.map((c) => cachedJSON<SearchEntry[]>(cache, chunkUrl(c))),
  );
  return chunks.filter(Boolean).flat() as SearchEntry[];
}

async function init(): Promise<void> {
  const cache = await getCache();

  // 1. Try to serve from cache immediately
  const cachedManifest = await cachedJSON<SearchManifest>(cache, MANIFEST_URL);
  if (cachedManifest) {
    const cached = await loadChunksFromCache(cache);
    if (cached.length > 0) {
      await buildFuse(cached, cache);
      signal("cached");
    }
  }

  // 2. Revalidate
  signal(fuse ? "revalidating" : "loading");

  try {
    const manifestRes = await fetch(MANIFEST_URL);
    if (!manifestRes.ok) throw new Error(`manifest ${manifestRes.status}`);
    const freshManifest = (await manifestRes.json()) as SearchManifest;

    // Version match — cache is current
    if (cachedManifest?.version === freshManifest.version && fuse) {
      signal("ready");
      return;
    }

    // Store fresh manifest
    await storeJSON(cache, MANIFEST_URL, freshManifest);

    // Diff chunk hashes — only fetch what changed
    const staleChunks = COLLECTIONS.filter((c) => {
      if (!cachedManifest) return true;
      return cachedManifest.chunks[c]?.hash !== freshManifest.chunks[c]?.hash;
    });

    // Fetch changed chunks and store in cache
    await Promise.all(
      staleChunks.map(async (c) => {
        const res = await fetch(chunkUrl(c));
        if (res.ok) await cache.put(chunkUrl(c), res);
      }),
    );

    // Rebuild Fuse from all (now-current) cached chunks
    // Invalidate the cached Fuse index since data changed
    await cache.delete(FUSE_INDEX_URL);
    const entries = await loadChunksFromCache(cache);
    await buildFuse(entries, cache);

    signal(cachedManifest ? "updated" : "ready");
  } catch {
    // Network failure — serve from cache if available
    signal(fuse ? "ready" : "error");
  }
}

function search(query: string, scope: string, limit: number, id: number): void {
  if (!fuse || !query.trim()) {
    self.postMessage({ type: "results", items: [], query, scope, id });
    return;
  }

  let results = fuse.search(query, { limit: scope === "global" ? limit : limit * 3 });

  if (scope !== "global") {
    results = results.filter((r) => r.item.collection === scope);
  }

  const items = results.slice(0, limit).map((r) => r.item);
  self.postMessage({ type: "results", items, query, scope, id });
}

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === "init") {
    init();
  } else if (msg.type === "search") {
    search(msg.query, msg.scope, msg.limit, msg.id);
  }
};
