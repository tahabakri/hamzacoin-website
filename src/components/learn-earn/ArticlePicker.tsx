import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
  fetchRandomSummary,
  fetchSummary,
  searchTitles,
  type ArticleSummary,
} from "../../hooks/useWikipediaArticle";
import { FEATURED_ARTICLES } from "../../utils/learnEarn";
import type { CompletedEntry } from "../../hooks/useLearnEarnProgress";

type Props = {
  onPick: (title: string, displayTitle: string) => void;
  completedEntries: CompletedEntry[];
  totalEarned: number;
};

export function ArticlePicker({ onPick, completedEntries, totalEarned }: Props) {
  const [featured, setFeatured] = useState<ArticleSummary[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Load featured cards on mount.
  useEffect(() => {
    let cancelled = false;
    setFeaturedLoading(true);
    Promise.allSettled(FEATURED_ARTICLES.map((a) => fetchSummary(a.title)))
      .then((settled) => {
        if (cancelled) return;
        const ok = settled
          .map((s, i) => {
            if (s.status === "fulfilled") return s.value;
            const fallback = FEATURED_ARTICLES[i]!;
            return {
              title: fallback.title,
              displayTitle: fallback.displayTitle,
              extract: "",
              thumbnailUrl: null,
              pageUrl: `https://en.wikipedia.org/wiki/${fallback.title}`,
            } satisfies ArticleSummary;
          });
        setFeatured(ok);
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search.
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      searchAbortRef.current?.abort();
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;
      searchTitles(q, ctrl.signal)
        .then((titles) => setResults(titles))
        .catch((err: unknown) => {
          if ((err as { name?: string })?.name === "AbortError") return;
          setResults([]);
        });
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleRandom = async () => {
    setRandomLoading(true);
    setError(null);
    try {
      const s = await fetchRandomSummary();
      onPick(s.title, s.displayTitle);
    } catch (err) {
      setError((err as Error)?.message ?? "Could not load a random article");
    } finally {
      setRandomLoading(false);
    }
  };

  const completedTitles = useMemo(
    () => new Set(completedEntries.map((e) => e.articleTitle.toLowerCase())),
    [completedEntries],
  );

  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-coffee-950 leading-tight">
            Pick an article to begin
          </h3>
          <p className="text-sm text-coffee-600 mt-1">
            Read, take a quick quiz, claim HMZ. One article — up to 5 HMZ.
          </p>
        </div>
        {totalEarned > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-coffee-100 border border-coffee-200 px-3 py-1.5 text-xs font-semibold text-coffee-900">
            <Icon icon="solar:hand-money-bold" className="text-base text-coffee-700" />
            {totalEarned} HMZ earned from learning
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleRandom}
          disabled={randomLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_8px_18px_rgba(67,48,36,0.18),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 transition-all disabled:opacity-70 font-semibold min-h-[44px] w-full sm:w-auto"
        >
          <Icon icon="solar:dice-linear" className="text-base" />
          {randomLoading ? "Picking..." : "Random article"}
        </button>

        <div className="relative flex-1">
          <label htmlFor="learnarn-search" className="sr-only">
            Search Wikipedia
          </label>
          <div className="relative">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-coffee-500"
            />
            <input
              id="learnarn-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => window.setTimeout(() => setShowResults(false), 150)}
              placeholder="Search Wikipedia..."
              className="w-full bg-white/70 border border-coffee-200 rounded-full pl-10 pr-4 py-3 text-sm text-stone-900 placeholder-coffee-400 focus:outline-none focus:border-coffee-500 transition-colors"
            />
          </div>
          {showResults && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-white border border-coffee-200 shadow-[0_18px_38px_-12px_rgba(67,48,36,0.25)] overflow-hidden max-h-80 overflow-y-auto">
              {results.map((title) => (
                <button
                  key={title}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onPick(title.replace(/ /g, "_"), title);
                    setQuery("");
                    setResults([]);
                    setShowResults(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-coffee-900 hover:bg-coffee-50 transition-colors flex items-center gap-2 min-h-[44px]"
                >
                  <Icon icon="solar:book-bookmark-linear" className="text-coffee-500" />
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Featured grid */}
      <div>
        <p className="text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-3">
          Featured
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(featuredLoading ? FEATURED_ARTICLES.map((a) => ({
              title: a.title,
              displayTitle: a.displayTitle,
              extract: "",
              thumbnailUrl: null as string | null,
              pageUrl: "",
            })) : featured).map((article) => {
            const isDone = completedTitles.has(article.title.toLowerCase());
            return (
              <button
                key={article.title}
                type="button"
                onClick={() => onPick(article.title, article.displayTitle)}
                className="group text-left rounded-2xl bg-white/70 border border-coffee-200 hover:border-coffee-400 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden shadow-[0_4px_12px_-4px_rgba(67,48,36,0.1)]"
              >
                <div className="aspect-[16/9] bg-coffee-100 relative overflow-hidden">
                  {article.thumbnailUrl ? (
                    <img
                      src={article.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-coffee-400">
                      <Icon icon="solar:book-2-linear" className="text-3xl" />
                    </div>
                  )}
                  {isDone && (
                    <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-semibold shadow-md">
                      <Icon icon="solar:check-circle-bold" className="text-xs" />
                      Earned
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-coffee-950 truncate">
                    {article.displayTitle}
                  </p>
                  <p className="text-[11px] text-coffee-500 mt-0.5 line-clamp-2">
                    {article.extract || (featuredLoading ? "Loading..." : "Wikipedia article")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
