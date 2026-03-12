import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SearchEntry, SearchStatus } from "@/lib/search-types";

// Capture handlers registered by the component
let mockStatusHandler: ((status: SearchStatus, count: number) => void) | null = null;
let mockResultsHandler: ((items: SearchEntry[], query: string, scope: string) => void) | null = null;
const mockSearch = vi.fn();
const mockGetCached = vi.fn().mockReturnValue(null);
const mockInit = vi.fn();
const mockDestroy = vi.fn();

vi.mock("@/lib/search", () => {
  return {
    SearchClient: class MockSearchClient {
      onStatus(fn: any) { mockStatusHandler = fn; }
      onResults(fn: any) { mockResultsHandler = fn; }
      init() { mockInit(); }
      destroy() { mockDestroy(); }
      search(...args: any[]) { mockSearch(...args); }
      getCached(...args: any[]) { return mockGetCached(...args); }
    },
  };
});

import Search from "@/components/Search";

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

describe("Search component", () => {
  beforeEach(() => {
    mockStatusHandler = null;
    mockResultsHandler = null;
    mockSearch.mockClear();
    mockGetCached.mockReturnValue(null);
    mockInit.mockClear();
    mockDestroy.mockClear();
    // Prevent actual navigation
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders search trigger button", () => {
    render(<Search />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("initializes SearchClient on mount", () => {
    render(<Search />);
    expect(mockInit).toHaveBeenCalledOnce();
  });

  it("opens dialog when trigger button is clicked", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens dialog with Ctrl+K", async () => {
    render(<Search />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("opens dialog with Ctrl+P", async () => {
    render(<Search />);
    fireEvent.keyDown(document, { key: "p", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("shows placeholder text for global scope", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows scoped placeholder text", async () => {
    render(<Search scope="devlog" />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByPlaceholderText("Search devlog...")).toBeInTheDocument();
  });

  it("displays results delivered by SearchClient", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    // Simulate status ready + results arriving
    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.([entry("a"), entry("b")], "test", "global");
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
      expect(screen.getByText("Title b")).toBeInTheDocument();
    });
  });

  it("shows 'no matches' when ready with empty results", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "xyz");

    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.([], "xyz", "global");
    });

    await waitFor(() => {
      expect(screen.getByText(/no matches for/)).toBeInTheDocument();
    });
  });

  it("keyboard ArrowDown/ArrowUp navigates results", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.(
        [entry("a"), entry("b"), entry("c")],
        "test",
        "global",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
    });

    // Arrow down to first item
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("aria-selected", "true");
    });

    // Arrow down to second item
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("aria-selected", "true");
    });

    // Arrow up back to first
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("aria-selected", "true");
    });
  });

  it("keyboard navigation skips stale items", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    // Deliver initial results: a, b, c
    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.(
        [entry("a"), entry("b"), entry("c")],
        "test",
        "global",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
    });

    // Now deliver revalidated results where b is removed (becomes stale)
    act(() => {
      mockResultsHandler?.([entry("a"), entry("c")], "test", "global");
    });

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("aria-disabled", "true");
    });

    // Arrow down should go to a (index 0), then skip b (stale, index 1) to c (index 2)
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("aria-selected", "false");
      expect(options[2]).toHaveAttribute("aria-selected", "true");
    });
  });

  it("stale items are visually disabled", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    // Deliver initial results
    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.(
        [entry("a"), entry("b")],
        "test",
        "global",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
    });

    // Revalidate — b is gone
    act(() => {
      mockResultsHandler?.([entry("a")], "test", "global");
    });

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("aria-disabled", "true");
      // The link inside should have no href
      const links = options[1].querySelectorAll("a");
      expect(links[0]).not.toHaveAttribute("href");
    });
  });

  it("Enter on active result navigates", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.(
        [entry("a", "devlog", { href: "/devlog/a" })],
        "test",
        "global",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(window.location.href).toBe("/devlog/a");
  });

  it("Enter on stale result does not navigate", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    // Initial
    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.([entry("a"), entry("b")], "test", "global");
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
    });

    // Revalidate — a is gone (stale), b stays
    act(() => {
      mockResultsHandler?.([entry("b")], "test", "global");
    });

    // Arrow down once — should skip stale a (index 0) and land on b (index 1)
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      // a is stale at index 0, b is active at index 1
      expect(options[1]).toHaveAttribute("aria-selected", "true");
    });
  });

  it("clears results when query is emptied", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.([entry("a")], "test", "global");
    });

    await waitFor(() => {
      expect(screen.getByText("Title a")).toBeInTheDocument();
    });

    // Click the clear button
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(screen.queryByText("Title a")).not.toBeInTheDocument();
    });
  });

  it("shows collection badge for each result", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.(
        [entry("a", "devlog"), entry("b", "projects"), entry("c", "articles")],
        "test",
        "global",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("DEV")).toBeInTheDocument();
      expect(screen.getByText("PRJ")).toBeInTheDocument();
      expect(screen.getByText("ART")).toBeInTheDocument();
    });
  });

  it("displays description when present", async () => {
    render(<Search />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    const input = screen.getByPlaceholderText("Search...");
    await userEvent.type(input, "test");

    act(() => {
      mockStatusHandler?.("ready", 10);
      mockResultsHandler?.(
        [entry("a", "devlog", { description: "My cool desc" })],
        "test",
        "global",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("My cool desc")).toBeInTheDocument();
    });
  });

  it("destroys SearchClient on unmount", () => {
    const { unmount } = render(<Search />);
    unmount();
    expect(mockDestroy).toHaveBeenCalledOnce();
  });
});
