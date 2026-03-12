import { Corpus } from "tiny-tfidf";

/**
 * Strip markdown syntax to plain text.
 * Handles standard markdown + Obsidian-specific syntax (wikilinks, callouts).
 */
function stripMarkdown(md: string): string {
  return (
    md
      // Remove code fences and their content
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`[^`]+`/g, "")
      // Strip Obsidian callout markers: > [!type]
      .replace(/>\s*\[!(\w+)\]\s*/g, "")
      // Convert wikilinks [[target|display]] or [[target]] to just the text
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      // Remove images ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      // Convert links [text](url) to just text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove HTML tags
      .replace(/<[^>]+>/g, "")
      // Remove headings markers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove emphasis markers
      .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
      // Remove blockquote markers
      .replace(/^\s*>\s?/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Build a TF-IDF corpus from all entries and extract top keywords per document.
 * Returns a Map from entry id to a space-separated keyword string.
 *
 * @param entries - Array of { id, body } objects (all collections combined)
 * @param topN - Max keywords per document
 */
export function extractAllKeywords(
  entries: { id: string; body: string }[],
  topN = 20,
): Map<string, string> {
  const ids = entries.map((e) => e.id);
  const texts = entries.map((e) => stripMarkdown(e.body));

  // Build corpus with default English stopwords + domain-specific noise terms
  const corpus = new Corpus(ids, texts, {
    customStopwords: [
      "example",
      "https",
      "http",
      "www",
      "com",
      "github",
      "true",
      "false",
      "null",
      "undefined",
    ],
  });

  const result = new Map<string, string>();
  for (const id of ids) {
    const topTerms = corpus.getTopTermsForDocument(id, topN);
    const keywords = topTerms.map(([term]: [string, number]) => term).join(" ");
    result.set(id, keywords);
  }

  return result;
}
