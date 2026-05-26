// ============================================================================
// useWikipediaArticle.ts — fetch Wikipedia summaries, full text, and search
// ----------------------------------------------------------------------------
// Three small APIs, all CORS-friendly with `origin=*`:
//
//   1. /page/random/summary           — random article (title, extract, thumb)
//   2. /page/summary/{title}          — short summary + thumbnail
//   3. /w/api.php?action=opensearch   — typeahead search
//   4. /w/api.php?action=query        — plain-text extract for the quiz
//   5. /api/rest_v1/page/html/{title} — fuller HTML for the reader pane
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";

export type ArticleSummary = {
  title: string; // URL slug
  displayTitle: string; // human-readable
  extract: string; // short summary text
  thumbnailUrl: string | null;
  pageUrl: string;
};

export type FullArticle = {
  summary: ArticleSummary;
  plainText: string; // for the quiz (sent to backend)
  html: string; // for the reader pane (sanitized, then dangerouslySetInnerHTML)
};

const REST_BASE = "https://en.wikipedia.org/api/rest_v1";
const API_BASE = "https://en.wikipedia.org/w/api.php";

type SummaryPayload = {
  title?: string;
  displaytitle?: string;
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

function payloadToSummary(p: SummaryPayload): ArticleSummary {
  const rawTitle = p.title ?? "";
  return {
    title: rawTitle.replace(/ /g, "_"),
    displayTitle: stripHtmlTags(p.displaytitle ?? rawTitle),
    extract: p.extract ?? "",
    thumbnailUrl: p.thumbnail?.source ?? null,
    pageUrl:
      p.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(rawTitle.replace(/ /g, "_"))}`,
  };
}

function stripHtmlTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

export async function fetchRandomSummary(signal?: AbortSignal): Promise<ArticleSummary> {
  const res = await fetch(`${REST_BASE}/page/random/summary`, { signal });
  if (!res.ok) throw new Error(`Wikipedia random failed: ${res.status}`);
  const json = (await res.json()) as SummaryPayload;
  return payloadToSummary(json);
}

export async function fetchSummary(
  title: string,
  signal?: AbortSignal,
): Promise<ArticleSummary> {
  const slug = encodeURIComponent(title.replace(/ /g, "_"));
  const res = await fetch(`${REST_BASE}/page/summary/${slug}`, { signal });
  if (!res.ok) throw new Error(`Wikipedia summary failed: ${res.status}`);
  const json = (await res.json()) as SummaryPayload;
  return payloadToSummary(json);
}

export async function searchTitles(
  query: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const params = new URLSearchParams({
    action: "opensearch",
    search: query,
    limit: "6",
    namespace: "0",
    format: "json",
    origin: "*",
  });
  const res = await fetch(`${API_BASE}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Wikipedia search failed: ${res.status}`);
  // opensearch returns [queryString, titles[], descriptions[], urls[]]
  const json = (await res.json()) as unknown;
  if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return [];
  return (json[1] as unknown[]).filter((s): s is string => typeof s === "string");
}

async function fetchPlainText(title: string, signal?: AbortSignal): Promise<string> {
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    explaintext: "1",
    exintro: "0",
    titles: title.replace(/_/g, " "),
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const res = await fetch(`${API_BASE}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Wikipedia extract failed: ${res.status}`);
  const json = (await res.json()) as { query?: { pages?: Array<{ extract?: string }> } };
  const extract = json.query?.pages?.[0]?.extract ?? "";
  // Trim to ~12 KB to stay inside backend bounds.
  return extract.length > 12_000 ? extract.slice(0, 12_000) : extract;
}

async function fetchHtml(title: string, signal?: AbortSignal): Promise<string> {
  const slug = encodeURIComponent(title.replace(/ /g, "_"));
  const res = await fetch(`${REST_BASE}/page/html/${slug}`, { signal });
  if (!res.ok) throw new Error(`Wikipedia HTML failed: ${res.status}`);
  return res.text();
}

export async function fetchFullArticle(
  title: string,
  signal?: AbortSignal,
): Promise<FullArticle> {
  const [summary, plainText, html] = await Promise.all([
    fetchSummary(title, signal),
    fetchPlainText(title, signal),
    fetchHtml(title, signal),
  ]);
  return { summary, plainText, html };
}

/**
 * React hook: load the full article body for a title. Abortable on title change.
 */
export function useFullArticle(title: string | null): {
  article: FullArticle | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!title) {
      setArticle(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    setError(null);
    fetchFullArticle(title, ctrl.signal)
      .then((a) => {
        setArticle(a);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError((err as Error)?.message ?? "Could not load article");
        setArticle(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      ctrl.abort();
    };
  }, [title, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { article, isLoading, error, reload };
}
