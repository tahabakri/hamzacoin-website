import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useFullArticle } from "../../hooks/useWikipediaArticle";
import {
  estimateReadingMinutes,
  htmlToPlainText,
  sanitizeWikipediaHtml,
  wikiUrl,
} from "../../utils/learnEarn";

type Props = {
  title: string;
  displayTitle: string;
  onReadyForQuiz: (params: { plainText: string; htmlReady: boolean }) => void;
  onStartQuiz: () => void;
  quizLoading: boolean;
  /** Hide the Start Quiz CTA — the user has already moved past the quiz. */
  quizActive?: boolean;
  /** The user has already graded/claimed for this article. */
  quizComplete?: boolean;
};

let loraInjected = false;
function ensureLoraFont(): void {
  if (loraInjected || typeof document === "undefined") return;
  loraInjected = true;
  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";
  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "anonymous";
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href =
    "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,700;1,400&display=swap";
  document.head.appendChild(pre1);
  document.head.appendChild(pre2);
  document.head.appendChild(sheet);
}

export function ArticleReader({
  title,
  displayTitle,
  onReadyForQuiz,
  onStartQuiz,
  quizLoading,
  quizActive = false,
  quizComplete = false,
}: Props) {
  const { article, isLoading, error, reload } = useFullArticle(title);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const endSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureLoraFont();
  }, []);

  // Reset scroll-end flag when article changes.
  useEffect(() => {
    setHasReachedEnd(false);
  }, [title]);

  // IntersectionObserver to detect when the bottom of the article is in view.
  useEffect(() => {
    if (!article) return;
    const sentinel = endSentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setHasReachedEnd(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [article]);

  // Pass plain text up so parent can post it to the backend when starting quiz.
  useEffect(() => {
    if (!article) return;
    const plain = article.plainText.length > 200
      ? article.plainText
      : htmlToPlainText(article.html); // fallback when extract is too short
    onReadyForQuiz({ plainText: plain, htmlReady: true });
  }, [article, onReadyForQuiz]);

  const sanitizedHtml = useMemo(
    () => (article ? sanitizeWikipediaHtml(article.html) : ""),
    [article],
  );

  const readingMinutes = useMemo(() => {
    if (!article) return 0;
    return estimateReadingMinutes(article.plainText || article.html);
  }, [article]);

  return (
    <div className="rounded-3xl bg-[#FBF6EE] border border-coffee-200 shadow-[0_18px_40px_-30px_rgba(67,48,36,0.4),inset_0_1px_0_white] overflow-hidden">
      {/* Reader header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-coffee-200 flex items-start justify-between gap-3 bg-white/40">
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wider">
            Wikipedia
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-coffee-950 truncate">
            {article?.summary.displayTitle ?? displayTitle}
          </h2>
          <p className="text-xs text-coffee-500 mt-0.5">
            {readingMinutes > 0 ? `~${readingMinutes} min read` : "Loading..."}
          </p>
        </div>
        <a
          href={article?.summary.pageUrl ?? wikiUrl(title)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs text-coffee-700 hover:text-coffee-950 underline-offset-2 hover:underline"
        >
          <Icon icon="solar:square-arrow-right-up-linear" className="text-sm" />
          Source
        </a>
      </div>

      {/* Body */}
      <div
        className="max-h-[60vh] sm:max-h-[68vh] overflow-y-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-6"
        aria-live="polite"
      >
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 bg-coffee-100 rounded animate-pulse" />
            <div className="h-4 bg-coffee-100 rounded animate-pulse w-11/12" />
            <div className="h-4 bg-coffee-100 rounded animate-pulse w-10/12" />
            <div className="h-4 bg-coffee-100 rounded animate-pulse w-11/12" />
            <div className="h-4 bg-coffee-100 rounded animate-pulse w-9/12" />
          </div>
        )}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm">
            <p className="font-semibold mb-1">Could not load article</p>
            <p>{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-100 hover:bg-red-200 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-800"
            >
              Try again
            </button>
          </div>
        )}
        {!isLoading && !error && article && (
          <article className="le-reader-body">
            <div
              className="le-reader-html"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
            <div ref={endSentinelRef} className="h-px w-full" aria-hidden="true" />
            <p className="mt-6 text-xs text-coffee-500 italic">
              Content from{" "}
              <a
                href={article.summary.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Wikipedia
              </a>
              , available under the CC BY-SA license.
            </p>
          </article>
        )}
      </div>

      {/* Sticky-ish footer — adapts to where the user is in the flow */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-coffee-200 bg-white/50 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-coffee-600">
          {quizComplete ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Icon icon="solar:check-circle-bold" className="text-base" />
              Quiz complete for this article.
            </span>
          ) : quizActive ? (
            <span className="inline-flex items-center gap-1.5 text-coffee-700 font-semibold">
              <Icon icon="solar:cup-hot-linear" className="text-base" />
              Quiz in progress — answer on the right.
            </span>
          ) : hasReachedEnd ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Icon icon="solar:check-circle-bold" className="text-base" />
              You've reached the end. Ready when you are.
            </span>
          ) : (
            <span>Scroll to the end of the article to unlock the quiz.</span>
          )}
        </div>
        {!quizActive && !quizComplete && (
          <button
            type="button"
            onClick={onStartQuiz}
            disabled={!hasReachedEnd || quizLoading || !article}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 sm:py-2.5 text-sm font-semibold transition-all duration-300 min-h-[44px] ${
              hasReachedEnd && article && !quizLoading
                ? "bg-gradient-to-b from-coffee-700 to-coffee-800 text-white border border-coffee-900 shadow-[0_8px_18px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700"
                : "bg-coffee-100 text-coffee-500 border border-coffee-200 cursor-not-allowed"
            }`}
          >
            <Icon icon="solar:cup-hot-linear" className="text-base" />
            {quizLoading ? "Brewing your quiz..." : "Start Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}
