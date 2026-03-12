import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from "@headlessui/react";
import {
  SearchClient,
  type SearchScope,
  type SearchEntry,
  type SearchStatus,
} from "@/lib/search";
import { mergeResults, type DisplayEntry } from "@/lib/search-merge";

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function modKey(key: string): string {
  return isMac ? `\u2318${key}` : `Ctrl+${key}`;
}

const COLLECTION_META: Record<
  SearchEntry["collection"],
  { label: string; color: string }
> = {
  projects: { label: "PRJ", color: "var(--color-pink)" },
  devlog: { label: "DEV", color: "var(--color-yellow)" },
  articles: { label: "ART", color: "var(--color-blue)" },
};

const DEBOUNCE_MS = 50;

export default function Search({ scope = "global" }: { scope?: SearchScope }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DisplayEntry[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);

  const listRef = useRef<HTMLUListElement>(null);
  const clientRef = useRef<SearchClient | null>(null);
  const queryRef = useRef(query);
  const scopeRef = useRef(scope);
  queryRef.current = query;
  scopeRef.current = scope;

  const resultsRef = useRef(results);
  resultsRef.current = results;
  // Track which query the currently displayed results belong to
  const displayedQueryRef = useRef("");

  // Eagerly init search on mount — don't wait for dialog open
  useEffect(() => {
    const client = new SearchClient();

    client.onStatus((s) => setStatus(s));
    client.onResults((items, q, s) => {
      if (q === queryRef.current && s === scopeRef.current) {
        const current = resultsRef.current;
        // Merge only when updating results for the same query (revalidation)
        // For a new query, replace entirely
        const isSameQuery = q === displayedQueryRef.current && current.length > 0;
        displayedQueryRef.current = q;
        setResults(isSameQuery ? mergeResults(current, items) : items);
      }
    });

    client.init();
    clientRef.current = client;

    return () => client.destroy();
  }, []);

  // Debounced search with instant cache hit
  useEffect(() => {
    if (!query.trim()) {
      displayedQueryRef.current = "";
      setResults([]);
      return;
    }

    const client = clientRef.current;
    if (!client) return;

    // Instant: serve from result cache (backspace optimization)
    const cached = client.getCached(query, scope);
    if (cached) {
      displayedQueryRef.current = query;
      setResults(cached);
    }

    // Debounced: send to worker for fresh results
    const timer = setTimeout(() => {
      client.search(query, scope);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, scope]);

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Scroll active result into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Keyboard shortcut: Cmd/Ctrl+K and Cmd/Ctrl+P
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "p")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleSelect = useCallback(
    (entry: DisplayEntry) => {
      if (entry.stale) return;
      handleClose();
      window.location.href = entry.href;
    },
    [handleClose],
  );

  function nextActiveIndex(from: number, dir: 1 | -1): number {
    let i = from + dir;
    while (i >= 0 && i < results.length && results[i].stale) i += dir;
    return i >= 0 && i < results.length ? i : from;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => nextActiveIndex(i, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => nextActiveIndex(i, -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex] && !results[activeIndex].stale) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  }

  const showScoped = scope !== "global";
  const isLoading = status === "loading" || status === "idle";
  const isRevalidating = status === "revalidating" || status === "cached";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer px-2 py-1 text-dim transition-colors duration-200 hover:text-white"
        aria-label={`Search (${modKey("K")})`}
        aria-keyshortcuts={isMac ? "Meta+k" : "Control+k"}
        title={`Search (${modKey("K")})`}
        type="button"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <Dialog open={open} onClose={handleClose} className="relative z-10000">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-150 ease-out data-closed:opacity-0 data-closed:duration-200"
        />

        <div className="fixed inset-0 flex items-start justify-center px-4 pt-[12vh] sm:pt-[18vh]">
          <DialogPanel
            transition
            className="search-panel w-full max-w-lg overflow-hidden border border-border-bright bg-black transition-opacity data-closed:opacity-0 data-closed:duration-200 data-closed:ease-in"
            style={{ boxShadow: "0 0 0 1px var(--color-border), 0 24px 64px rgba(0,0,0,0.7)" }}
          >
            {/* ── Search input ── */}
            <label className="search-input-bar flex items-center gap-3 border-b border-border bg-surface px-5 py-3.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-dim"
                aria-hidden="true"
              >
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={showScoped ? `Search ${scope}...` : "Search..."}
                className="min-w-0 flex-1 bg-transparent px-1.5 py-1 font-mono text-sm text-white placeholder:text-dim outline-none"
                autoFocus
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  className="cursor-pointer p-0.5 text-dim transition-colors hover:text-gray"
                  aria-label="Clear"
                  type="button"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <kbd className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-dim">ESC</kbd>
              )}
            </label>

            {/* ── Results area ── */}
            <div className="max-h-[min(50vh,400px)] overflow-y-auto overscroll-contain">
              {/* Loading — no cache, waiting for first index */}
              {isLoading && query && results.length === 0 && (
                <p className="px-4 py-8 text-center font-mono text-xs text-dim">loading...</p>
              )}

              {/* No results */}
              {!isLoading && query && results.length === 0 && (
                <p className="px-4 py-8 text-center font-mono text-xs text-dim">
                  no matches for <span className="text-gray">"{query}"</span>
                </p>
              )}

              {/* Results list */}
              {results.length > 0 && (
                <ul ref={listRef} role="listbox">
                  {results.map((entry, i) => {
                    const meta = COLLECTION_META[entry.collection];
                    const isActive = i === activeIndex;
                    const isStale = !!entry.stale;
                    return (
                      <li
                        key={`${entry.collection}-${entry.id}`}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={isStale || undefined}
                      >
                        <a
                          href={isStale ? undefined : entry.href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isStale) handleSelect(entry);
                          }}
                          onMouseEnter={() => { if (!isStale) setActiveIndex(i); }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                            isStale ? "pointer-events-none select-none" : "cursor-pointer"
                          }`}
                          style={{
                            opacity: isStale ? 0.3 : undefined,
                            background: isActive && !isStale
                              ? `color-mix(in srgb, ${meta.color} 6%, transparent)`
                              : undefined,
                            borderLeft: isActive && !isStale
                              ? `2px solid ${meta.color}`
                              : "2px solid transparent",
                          }}
                          tabIndex={isStale ? -1 : undefined}
                          aria-hidden={isStale || undefined}
                        >
                          <span
                            className="shrink-0 border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest"
                            style={{
                              color: meta.color,
                              borderColor: isActive && !isStale
                                ? `color-mix(in srgb, ${meta.color} 30%, transparent)`
                                : "var(--color-border)",
                              opacity: isStale ? 1 : isActive ? 1 : 0.6,
                            }}
                          >
                            {meta.label}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate font-mono text-sm ${isActive && !isStale ? "text-white" : "text-gray"}`}>
                              {entry.title}
                            </span>
                            {entry.description && (
                              <span className="block truncate text-xs text-dim">
                                {entry.description}
                              </span>
                            )}
                          </span>
                          {entry.date && (
                            <span className="shrink-0 font-mono text-[10px] text-dim tabular-nums">
                              {new Date(entry.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Footer — empty state or status */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-dim">
                  {showScoped ? scope : "all content"}
                  {isRevalidating && (
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow" title="Updating index..." />
                  )}
                </span>
                {!query && (
                  <span className="flex gap-4 font-mono text-[10px] text-dim">
                    <span>
                      <kbd className="border border-border px-1 py-0.5 text-gray">↑↓</kbd> nav
                    </span>
                    <span>
                      <kbd className="border border-border px-1 py-0.5 text-gray">↵</kbd> go
                    </span>
                  </span>
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
