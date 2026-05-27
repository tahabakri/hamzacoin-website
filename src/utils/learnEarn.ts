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
 * 60KB sanitizer. Wikipedia's REST `page/html` endpoint returns a full
 * HTML document (with <head>, <link rel="stylesheet">, <base>, inline
 * style attributes, etc.) — when fed raw to `dangerouslySetInnerHTML`,
 * the browser parses those tags and fetches Wikipedia's CSS, which
 * then applies GLOBALLY to our page and persists after the article
 * closes (e.g. the coffee palette turns Wikipedia-blue).
 *
 * This sanitizer strips:
 *   - the whole <head> block (link, meta, base, title, etc.)
 *   - <html>, <body> wrappers (keep their children)
 *   - <script>, <style>, <link>, <meta>, <base> tags wherever they appear
 *   - inline event handlers (onclick, onerror, ...)
 *   - inline `style="..."` attributes (Wikipedia uses these for colors
 *     and layout that would override our theme)
 *   - <iframe>, <object>, <embed>
 *   - `javascript:` URLs
 *
 * Not a security replacement for DOMPurify if you ever render arbitrary
 * upstream HTML — only good for trusted-source rendering like Wikipedia.
 */
export function sanitizeWikipediaHtml(html: string): string {
  let out = html;

  // Remove the entire <head>...</head> block — this is the biggest leak,
  // it carries <link rel="stylesheet">, <base>, <meta charset>, etc.
  out = out.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");

  // Strip <html ...> and <body ...> wrapper tags (keep their content).
  out = out.replace(/<\/?(?:html|body)[^>]*>/gi, "");

  // Remove <script>...</script> entirely.
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Remove <style>...</style> entirely (we use our own .le-reader-* CSS).
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Strip standalone (void) tags: <link>, <meta>, <base>. These otherwise
  // leak stylesheets, base hrefs, and meta-refreshes into our document.
  out = out.replace(/<(?:link|meta|base)\b[^>]*\/?>/gi, "");

  // Strip inline event handlers like onclick=, onerror=, onload=, etc.
  out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");

  // Strip inline style="..." attributes. Wikipedia ships color, font,
  // background, and layout styles inline that would override our palette.
  out = out.replace(/\sstyle\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\sstyle\s*=\s*'[^']*'/gi, "");

  // Strip javascript: URLs.
  out = out.replace(/javascript:/gi, "");

  // Remove <iframe>, <object>, <embed>.
  out = out.replace(/<(iframe|object|embed)[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(iframe|object|embed)\b[^>]*\/?>/gi, "");

  return out;
}

/** Strip HTML tags to recover plain text (used for word counts). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, " ")
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
