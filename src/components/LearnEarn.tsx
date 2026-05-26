// ============================================================================
// LearnEarn.tsx — top-level "Learn & Earn HMZ" section
// ----------------------------------------------------------------------------
// Reads Wikipedia articles, generates a 5-question quiz via the backend,
// grades it, and lets users claim HMZ from the on-chain faucet using an
// EIP-712 signature from the backend.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { BrowserProvider } from "ethers";
import { BACKEND_URL } from "../utils/constants";
import { fireSideCannons } from "../utils/confetti";
import { useFaucetContract } from "../hooks/useFaucetContract";
import { useLearnEarnState, type GradeResult } from "../hooks/useLearnEarnState";
import { useLearnEarnProgress } from "../hooks/useLearnEarnProgress";
import { LearnEarnProgressBar } from "./learn-earn/ProgressBar";
import { ArticlePicker } from "./learn-earn/ArticlePicker";
import { ArticleReader } from "./learn-earn/ArticleReader";
import { QuizPanel } from "./learn-earn/QuizPanel";
import { ScoreReveal } from "./learn-earn/ScoreReveal";
import { ClaimReward } from "./learn-earn/ClaimReward";

type Props = {
  account: string;
  walletProvider: BrowserProvider | null;
  onConnect: () => void;
  ensureSepolia: () => Promise<void>;
  reduceMotion: boolean;
  onClaimSuccess: (params: {
    score: number;
    articleTitle: string;
    txHash: string;
  }) => void;
};

function statusToStep(status: string): number {
  switch (status) {
    case "picking":
      return -1;
    case "reading":
      return 0;
    case "quizzing":
    case "grading":
      return 1;
    case "scoring":
      return 2;
    case "claiming":
      return 3;
    case "claimed":
    case "done-no-reward":
      return 3;
    default:
      return -1;
  }
}

export function LearnEarn({
  account,
  walletProvider,
  onConnect,
  ensureSepolia,
  reduceMotion,
  onClaimSuccess,
}: Props) {
  const { state, actions } = useLearnEarnState();
  const progress = useLearnEarnProgress();
  const faucet = useFaucetContract(walletProvider, account, ensureSepolia);

  const [quizLoading, setQuizLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Cache the article text + sanitized HTML for the currently selected article so
  // we can post the plain text to the backend without re-fetching.
  const plainTextRef = useRef<string>("");

  const handleReaderReady = useCallback(
    ({ plainText }: { plainText: string; htmlReady: boolean }) => {
      plainTextRef.current = plainText;
    },
    [],
  );

  const handleStartQuiz = useCallback(async () => {
    if (!state.articleTitle || !state.articleDisplayTitle) return;
    const articleText = plainTextRef.current.trim();
    if (articleText.length < 200) {
      setNetworkError(
        "Article content is too short to generate a quiz. Try a different article.",
      );
      return;
    }
    setNetworkError(null);
    setQuizLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleText: articleText.slice(0, 14_500),
          articleTitle: state.articleDisplayTitle,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Quiz request failed (${res.status})`);
      }
      const data = (await res.json()) as {
        articleHash: string;
        questions: { id: number; question: string; options: string[] }[];
      };
      if (!data.questions?.length) {
        throw new Error("Quiz generator returned no questions");
      }
      actions.startQuiz(data.articleHash, data.questions);
    } catch (err) {
      setNetworkError((err as Error)?.message ?? "Could not generate a quiz");
    } finally {
      setQuizLoading(false);
    }
  }, [actions, state.articleTitle, state.articleDisplayTitle]);

  const handleSubmitAnswers = useCallback(async () => {
    if (!state.articleHash) return;
    if (state.answers.some((a) => a === null)) return;
    setNetworkError(null);
    actions.submitGrading();
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify-and-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleHash: state.articleHash,
          userAddress: account || "0x0000000000000000000000000000000000000000",
          answers: state.answers,
        }),
      });
      if (res.status === 410) {
        // Cache expired — push user back to picker.
        actions.error("Quiz expired. Please re-fetch by re-starting the quiz.");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Verify request failed (${res.status})`);
      }
      const data = (await res.json()) as GradeResult & { message?: string };
      actions.gradingDone(data);
    } catch (err) {
      actions.error((err as Error)?.message ?? "Could not grade your answers");
    }
  }, [account, actions, state.articleHash, state.answers]);

  const handleClaim = useCallback(async () => {
    if (!state.result || !state.articleHash) return;
    if (!state.result.signature) return;
    actions.startClaim();
    const out = await faucet.claim({
      score: state.result.score,
      articleHash: state.articleHash,
      signature: state.result.signature,
    });
    if (out.ok && out.txHash) {
      actions.claimDone(out.txHash);
      progress.add({
        articleHash: state.articleHash,
        articleTitle: state.articleTitle ?? "",
        displayTitle: state.articleDisplayTitle ?? "",
        score: state.result.score,
        earnedHmz: state.result.score,
        completedAt: Date.now(),
        txHash: out.txHash,
      });
      if (!reduceMotion) {
        fireSideCannons();
      }
      onClaimSuccess({
        score: state.result.score,
        articleTitle: state.articleDisplayTitle ?? "Learn & Earn",
        txHash: out.txHash,
      });
    } else {
      // Surface the error in the panel; revert FSM to scoring so user can retry.
      actions.gradingDone(state.result);
    }
  }, [
    actions,
    faucet,
    onClaimSuccess,
    progress,
    reduceMotion,
    state.articleHash,
    state.articleTitle,
    state.articleDisplayTitle,
    state.result,
  ]);

  // If the user has score === 0 they don't see a claim, but FSM stays in scoring.
  const showClaimSurface =
    state.status === "scoring" ||
    state.status === "claiming" ||
    state.status === "claimed";

  const activeStep = useMemo(() => statusToStep(state.status), [state.status]);

  const rightPanel = (() => {
    if (state.status === "picking") {
      return (
        <ArticlePicker
          onPick={actions.pickArticle}
          completedEntries={progress.entries}
          totalEarned={progress.totalEarned}
        />
      );
    }
    if (
      state.status === "reading" ||
      (state.status === "quizzing" && state.questions.length === 0)
    ) {
      return (
        <div className="rounded-2xl bg-white/55 backdrop-blur-md border border-coffee-200 p-5 space-y-4 text-center">
          <Icon icon="solar:cup-hot-linear" className="text-4xl text-coffee-500 mx-auto" />
          <p className="text-sm text-coffee-700">
            Read the article on the left. When you reach the end, the quiz button unlocks.
          </p>
          {quizLoading && (
            <p className="text-xs text-coffee-500 hmz-pulse-pending">
              Brewing your quiz...
            </p>
          )}
          {networkError && (
            <p className="text-xs text-red-700">{networkError}</p>
          )}
        </div>
      );
    }
    if (state.status === "quizzing" || state.status === "grading") {
      return (
        <QuizPanel
          questions={state.questions}
          answers={state.answers}
          onAnswer={actions.setAnswer}
          onSubmit={handleSubmitAnswers}
          isGrading={state.status === "grading"}
        />
      );
    }
    if (showClaimSurface && state.result) {
      return (
        <div className="space-y-5">
          <ScoreReveal
            questions={state.questions}
            result={state.result}
            reduceMotion={reduceMotion}
          />
          <ClaimReward
            score={state.result.score}
            account={account}
            isClaimPending={faucet.isClaimPending || state.status === "claiming"}
            txStatus={faucet.txStatus}
            onConnect={onConnect}
            onClaim={handleClaim}
            onSkip={() => {
              actions.backToPicker();
              faucet.reset();
            }}
            onDone={() => {
              actions.backToPicker();
              faucet.reset();
            }}
          />
        </div>
      );
    }
    if (state.status === "done-no-reward") {
      return (
        <ClaimReward
          score={0}
          account={account}
          isClaimPending={false}
          txStatus={faucet.txStatus}
          onConnect={onConnect}
          onClaim={handleClaim}
          onSkip={() => actions.backToPicker()}
          onDone={() => actions.backToPicker()}
        />
      );
    }
    if (state.status === "error") {
      return (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-5 space-y-3">
          <div className="flex items-start gap-2">
            <Icon icon="solar:shield-warning-bold" className="text-xl text-red-700 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">Something went wrong.</p>
              <p className="text-xs text-red-800 mt-0.5">
                {state.errorMessage ?? "Please try again."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => actions.backToPicker()}
            className="inline-flex items-center gap-1.5 rounded-full bg-coffee-700 hover:bg-coffee-800 text-white px-4 py-2 text-xs font-semibold transition-colors"
          >
            Start over
          </button>
        </div>
      );
    }
    return null;
  })();

  // Re-emit the article-ready signal whenever its memo identity changes by
  // re-binding the callback.  (handleReaderReady is stable; no extra work needed.)
  useEffect(() => {
    if (state.status === "picking") {
      plainTextRef.current = "";
    }
  }, [state.status]);

  return (
    <section id="learn-earn" className="relative py-20 sm:py-28 px-6">
      <style>{`
        .le-reader-body { font-family: "Lora", Georgia, "Times New Roman", serif; line-height: 1.75; color: #271B14; }
        .le-reader-body { font-size: 16px; }
        .le-reader-html { max-width: 65ch; }
        .le-reader-html h1, .le-reader-html h2, .le-reader-html h3 { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #271B14; margin-top: 1.4em; margin-bottom: 0.5em; }
        .le-reader-html h2 { font-size: 1.25rem; font-weight: 700; }
        .le-reader-html h3 { font-size: 1.1rem; font-weight: 600; }
        .le-reader-html p { margin: 0.85em 0; }
        .le-reader-html a { color: #6C4F3B; text-decoration: underline; text-underline-offset: 2px; }
        .le-reader-html a:hover { color: #271B14; }
        .le-reader-html img, .le-reader-html figure, .le-reader-html .thumb { display: none; }
        .le-reader-html table { display: none; }
        .le-reader-html sup, .le-reader-html .reference, .le-reader-html .mw-editsection, .le-reader-html .hatnote, .le-reader-html .navbox, .le-reader-html .infobox, .le-reader-html .sidebar, .le-reader-html .metadata, .le-reader-html .ambox, .le-reader-html .toc { display: none; }
        .le-reader-html ul, .le-reader-html ol { padding-left: 1.5em; margin: 0.85em 0; }
        .le-reader-html li { margin: 0.35em 0; }
        .le-reader-html blockquote { border-left: 3px solid #84644D; padding-left: 1em; color: #563E2F; margin: 1em 0; font-style: italic; }
      `}</style>

      <div className="relative max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-coffee-100 border border-coffee-200 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-coffee-700 shadow-[inset_0_1px_0_white]">
              <Icon icon="solar:book-bookmark-linear" className="text-sm" />
              Learn & Earn HMZ
            </div>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-coffee-950 leading-[1.05]">
              Read. Quiz. Earn HMZ.
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-coffee-600">
              Pick a Wikipedia article, answer a 5-question quiz, and a signature-gated faucet on Sepolia pays out up to 5 HMZ. No staking, no purchase — just curiosity.
            </p>
          </div>
          {state.status !== "picking" && (
            <button
              type="button"
              onClick={() => {
                actions.backToPicker();
                faucet.reset();
                setNetworkError(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 hover:bg-white border border-coffee-200 px-3.5 py-2 text-xs font-semibold text-coffee-800 transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="text-base" />
              Change article
            </button>
          )}
        </div>

        {/* Glass panel */}
        <div className="rounded-[2.75rem] bg-white/55 backdrop-blur-xl border border-white shadow-[0_30px_80px_-45px_rgba(67,48,36,0.3),inset_0_1px_0_rgba(255,255,255,1)] p-5 sm:p-8">
          {/* Progress */}
          <div className="mb-6">
            <LearnEarnProgressBar activeIndex={activeStep} />
          </div>

          {networkError && state.status !== "error" && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm">
              {networkError}
            </div>
          )}

          {state.status === "picking" ? (
            // No article yet — single column picker
            <div>{rightPanel}</div>
          ) : (
            // Article selected — 2-column on lg+, stacked on mobile
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6 lg:gap-8 items-start">
              <div className="min-w-0">
                {state.articleTitle && state.articleDisplayTitle && (
                  <ArticleReader
                    title={state.articleTitle}
                    displayTitle={state.articleDisplayTitle}
                    onReadyForQuiz={handleReaderReady}
                    onStartQuiz={handleStartQuiz}
                    quizLoading={quizLoading}
                    quizActive={
                      state.status === "quizzing" || state.status === "grading"
                    }
                    quizComplete={
                      state.status === "scoring" ||
                      state.status === "claiming" ||
                      state.status === "claimed" ||
                      state.status === "done-no-reward"
                    }
                  />
                )}
              </div>
              <div className="lg:sticky lg:top-28">{rightPanel}</div>
            </div>
          )}

          {/* Completed history */}
          {progress.entries.length > 0 && state.status === "picking" && (
            <div className="mt-8 pt-6 border-t border-coffee-200/60">
              <p className="text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-3">
                Recently earned
              </p>
              <ul className="space-y-2">
                {progress.entries.slice(0, 5).map((entry) => (
                  <li
                    key={entry.articleHash}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/60 border border-coffee-100 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-coffee-950 truncate">
                        {entry.displayTitle || entry.articleTitle}
                      </p>
                      <p className="text-[10px] text-coffee-500 font-mono">
                        {new Date(entry.completedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-coffee-100 border border-coffee-200 px-2.5 py-1 text-xs font-semibold text-coffee-800">
                      +{entry.earnedHmz} HMZ
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
