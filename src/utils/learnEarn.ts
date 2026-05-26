// ============================================================================
// learnEarn.ts — helpers for the Learn & Earn section
// ----------------------------------------------------------------------------
// Featured articles, reading-time estimator, lightweight HTML sanitizer for
// Wikipedia content, and small fetch helpers.
// ============================================================================

export type FeaturedArticle = {
  title: string; // URL-style title (underscores, e.g. "Distributed_computing")
  displayTitle: string; // human title for the picker card
};

export const FEATURED_ARTICLES: FeaturedArticle[] = [
  { title: "Blockchain", displayTitle: "Blockchain" },
  { title: "Ethereum", displayTitle: "Ethereum" },
  { title: "Bitcoin", displayTitle: "Bitcoin" },
  { title: "Cryptography", displayTitle: "Cryptography" },
  { title: "Computer_science", displayTitle: "Computer Science" },
  { title: "Distributed_computing", displayTitle: "Distributed Computing" },
];

/** Rough reading-time estimate (minutes), based on 200 wpm. */
export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Strip the dangerous bits out of Wikipedia HTML without pulling in a
 * 60KB sanitizer. Wikipedia's REST `page/html` endpoint already returns
 * fairly clean HTML; we just remove anything that could execute or load
 * remote resources we don't want.
 *
 * Not a security replacement for DOMPurify if you ever render arbitrary
 * upstream HTML — only good for trusted-source rendering like Wikipedia.
 */
export function sanitizeWikipediaHtml(html: string): string {
  let out = html;
  // Remove <script>...</script> entirely.
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove <style>...</style> entirely (Wikipedia injects some; we use our own).
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Strip inline event handlers like onclick=, onerror=, etc.
  out = out.replace(/\son[a-z]+="[^"]*"/gi, "");
  out = out.replace(/\son[a-z]+='[^']*'/gi, "");
  // Strip javascript: URLs.
  out = out.replace(/javascript:/gi, "");
  // Remove <iframe>, <object>, <embed>.
  out = out.replace(/<(iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(iframe|object|embed)[^>]*\/?>/gi, "");
  return out;
}

/** Strip HTML tags to recover plain text (used for word counts). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert a Wikipedia title to a URL-safe slug for the REST API. */
export function toWikiSlug(title: string): string {
  return encodeURIComponent(title.replace(/ /g, "_"));
}

/** Wikipedia article-page URL (used for the source link). */
export function wikiUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${toWikiSlug(title)}`;
}
