import type {
  SearchEntry,
  SearchScope,
  SearchStatus,
} from "./search-types";

export type { SearchEntry, SearchScope, SearchStatus };

type StatusHandler = (status: SearchStatus, entryCount: number) => void;
type ResultsHandler = (items: SearchEntry[], query: string, scope: string) => void;

/**
 * SearchClient — thin main-thread wrapper around the search web worker.
 * Falls back to fetching a pre-built static Fuse index if workers
 * or the Cache API are unavailable (just parseIndex, no createIndex).
 */
const CACHE_MAX = 10;

export class SearchClient {
  private worker: Worker | null = null;
  private statusHandler: StatusHandler | null = null;
  private resultsHandler: ResultsHandler | null = null;
  private idCounter = 0;
  private _fallbackFuse: any = null;

  // LRU result cache — most-recent query at the end, evicts oldest past CACHE_MAX
  private cache = new Map<string, SearchEntry[]>();

  private cacheSet(key: string, items: SearchEntry[]): void {
    this.cache.delete(key); // move to end
    this.cache.set(key, items);
    if (this.cache.size > CACHE_MAX) {
      this.cache.delete(this.cache.keys().next().value!);
    }
  }

  onStatus(fn: StatusHandler): void {
    this.statusHandler = fn;
  }

  onResults(fn: ResultsHandler): void {
    this.resultsHandler = fn;
  }

  /**
   * Start loading search data immediately.
   * Worker path: spawns worker, which reads Cache API + revalidates.
   * Fallback path: fetches pre-built index, parses it (no index construction).
   */
  init(): void {
    if (typeof Worker !== "undefined" && typeof caches !== "undefined") {
      try {
        this.worker = new Worker(
          new URL("./search-worker.ts", import.meta.url),
          { type: "module" },
        );
        this.worker.onmessage = (e) => this.handleWorkerMessage(e.data);
        this.worker.postMessage({ type: "init" });
        return;
      } catch {
        // Module workers not supported — fall through to fallback
      }
    }

    this.initFallback();
  }

  private handleWorkerMessage(data: any): void {
    if (data.type === "status") {
      this.statusHandler?.(data.state as SearchStatus, data.entryCount);
    } else if (data.type === "results") {
      this.cacheSet(`${data.scope}:${data.query}`, data.items);
      this.resultsHandler?.(data.items, data.query, data.scope);
    }
  }

  /**
   * Fallback: fetch the pre-built Fuse index from the server.
   * Only parseIndex on main thread — no createIndex.
   */
  private async initFallback(): Promise<void> {
    this.statusHandler?.("loading", 0);
    try {
      const [Fuse, data] = await Promise.all([
        import("fuse.js").then((m) => m.default),
        fetch("/search/all.json").then((r) => r.json()),
      ]);

      const { FUSE_OPTIONS } = await import("./search-types");
      const index = Fuse.parseIndex<SearchEntry>(data.index);
      this._fallbackFuse = new Fuse(data.entries, { ...FUSE_OPTIONS }, index);
      this.statusHandler?.("ready", data.entries.length);
    } catch {
      this.statusHandler?.("error", 0);
    }
  }

  /**
   * Get previously cached results for a query (instant backspace).
   */
  getCached(query: string, scope: SearchScope): SearchEntry[] | null {
    const key = `${scope}:${query}`;
    const items = this.cache.get(key);
    if (!items) return null;
    // Touch for LRU ordering
    this.cache.delete(key);
    this.cache.set(key, items);
    return items;
  }

  /**
   * Send a search query. Results arrive asynchronously via onResults.
   */
  search(query: string, scope: SearchScope, limit = 20): void {
    const id = ++this.idCounter;

    if (this.worker) {
      this.worker.postMessage({ type: "search", query, scope, limit, id });
    } else if (this._fallbackFuse) {
      let results = this._fallbackFuse.search(query, { limit: limit * 3 });
      if (scope !== "global") {
        results = results.filter((r: any) => r.item.collection === scope);
      }
      const items = results.slice(0, limit).map((r: any) => r.item);
      this.cacheSet(`${scope}:${query}`, items);
      // Deliver synchronously via microtask to keep the same async contract
      queueMicrotask(() => this.resultsHandler?.(items, query, scope));
    }
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this._fallbackFuse = null;
    this.cache.clear();
  }
}
