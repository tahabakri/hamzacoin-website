import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { GradeResult, PublicQuestion } from "../../hooks/useLearnEarnState";

type Props = {
  questions: PublicQuestion[];
  result: GradeResult;
  reduceMotion: boolean;
};

export function ScoreReveal({ questions, result, reduceMotion }: Props) {
  const [revealedCount, setRevealedCount] = useState<number>(reduceMotion ? questions.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setRevealedCount(questions.length);
      return;
    }
    setRevealedCount(0);
    const intervals: number[] = [];
    for (let i = 0; i < questions.length; i++) {
      intervals.push(
        window.setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), 220 + i * 300),
      );
    }
    return () => {
      intervals.forEach((id) => window.clearTimeout(id));
    };
  }, [questions.length, reduceMotion]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wider">
          Your score
        </p>
        <p
          className="text-5xl sm:text-6xl font-bold text-coffee-950 mt-1 tabular-nums"
          aria-live="polite"
        >
          {result.score}
          <span className="text-coffee-400 text-3xl"> / {questions.length}</span>
        </p>
        <p className="text-sm text-coffee-700 mt-2">
          {result.score === 0
            ? "No HMZ this round — try a different article."
            : `That's ${result.score} HMZ ready to claim.`}
        </p>
      </div>

      <ul className="space-y-2">
        {questions.map((q, i) => {
          const ok = result.perAnswer[i] === true;
          const visible = i < revealedCount;
          return (
            <li
              key={q.id}
              className={`rounded-2xl border px-4 py-3 transition-all duration-500 ${
                visible
                  ? ok
                    ? "bg-emerald-50 border-emerald-200 opacity-100 translate-y-0"
                    : "bg-red-50 border-red-200 opacity-100 translate-y-0"
                  : "bg-coffee-50 border-coffee-100 opacity-0 translate-y-2"
              }`}
              aria-hidden={!visible}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}
                  aria-label={ok ? "Correct" : "Incorrect"}
                >
                  <Icon
                    icon={ok ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                    className="text-base"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      ok ? "text-emerald-900" : "text-red-900"
                    }`}
                  >
                    Q{i + 1}. {q.question}
                  </p>
                  {!ok && result.explanations?.[i] && (
                    <p className="text-xs text-coffee-700 mt-1 leading-snug">
                      <span className="font-semibold">Why: </span>
                      {result.explanations[i]}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
