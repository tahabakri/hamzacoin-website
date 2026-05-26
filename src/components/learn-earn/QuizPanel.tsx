import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { PublicQuestion } from "../../hooks/useLearnEarnState";

type Props = {
  questions: PublicQuestion[];
  answers: (number | null)[];
  onAnswer: (index: number, value: number) => void;
  onSubmit: () => void;
  isGrading: boolean;
};

export function QuizPanel({ questions, answers, onAnswer, onSubmit, isGrading }: Props) {
  const [current, setCurrent] = useState(0);
  const firstOptionRef = useRef<HTMLInputElement | null>(null);

  // Focus the first option when navigating to a new question.
  useEffect(() => {
    firstOptionRef.current?.focus();
  }, [current]);

  const q = questions[current];
  const answered = answers[current];
  const isLast = current === questions.length - 1;

  // Keyboard shortcuts: 1-4 to pick, Enter to advance.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        // Allow native form key handling for radio buttons via arrow keys; only
        // intercept digits for the numeric-shortcut feature.
        if (!/^[1-4]$/.test(e.key)) return;
      }
      if (/^[1-4]$/.test(e.key) && q) {
        const idx = Number(e.key) - 1;
        if (idx < q.options.length) {
          onAnswer(current, idx);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, onAnswer, q]);

  const progressLabel = useMemo(
    () => `Question ${current + 1} of ${questions.length}`,
    [current, questions.length],
  );

  if (!q) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wider">
            Quiz
          </p>
          <p
            className="text-sm font-semibold text-coffee-900"
            role="status"
            aria-live="polite"
          >
            {progressLabel}
          </p>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current
                  ? "bg-coffee-800 scale-125"
                  : answers[i] !== null
                    ? "bg-coffee-500"
                    : "bg-coffee-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <fieldset className="flex-1" role="radiogroup" aria-labelledby={`q-${q.id}-label`}>
        <legend id={`q-${q.id}-label`} className="text-lg font-semibold text-coffee-950 mb-4 leading-snug">
          {q.question}
        </legend>
        <div className="space-y-2.5">
          {q.options.map((opt, optIdx) => {
            const checked = answered === optIdx;
            const inputId = `q-${q.id}-opt-${optIdx}`;
            return (
              <label
                key={inputId}
                htmlFor={inputId}
                className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all duration-200 ${
                  checked
                    ? "bg-coffee-100 border-coffee-500 shadow-[inset_0_1px_0_white]"
                    : "bg-white/70 border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50"
                }`}
              >
                <input
                  ref={optIdx === 0 ? firstOptionRef : null}
                  id={inputId}
                  type="radio"
                  name={`q-${q.id}`}
                  value={optIdx}
                  checked={checked}
                  onChange={() => onAnswer(current, optIdx)}
                  className="sr-only"
                />
                <span
                  className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-semibold transition-colors ${
                    checked
                      ? "bg-coffee-700 border-coffee-800 text-white"
                      : "bg-white border-coffee-300 text-coffee-500 group-hover:border-coffee-500"
                  }`}
                  aria-hidden="true"
                >
                  {optIdx + 1}
                </span>
                <span
                  className={`text-sm leading-snug ${
                    checked ? "text-coffee-950 font-medium" : "text-coffee-800"
                  }`}
                >
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 hover:bg-white border border-coffee-200 px-4 py-2 text-xs font-semibold text-coffee-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon icon="solar:alt-arrow-left-linear" className="text-base" />
          Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={answered === null || isGrading}
            aria-busy={isGrading}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              answered !== null && !isGrading
                ? "bg-gradient-to-b from-coffee-700 to-coffee-800 text-white border border-coffee-900 shadow-[0_8px_18px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700"
                : "bg-coffee-100 text-coffee-500 border border-coffee-200 cursor-not-allowed"
            } ${isGrading ? "hmz-pulse-pending" : ""}`}
          >
            <Icon icon="solar:medal-star-linear" className="text-base" />
            {isGrading ? "Grading..." : "Grade my answers"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            disabled={answered === null}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              answered !== null
                ? "bg-gradient-to-b from-coffee-700 to-coffee-800 text-white border border-coffee-900 shadow-[0_8px_18px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700"
                : "bg-coffee-100 text-coffee-500 border border-coffee-200 cursor-not-allowed"
            }`}
          >
            Next
            <Icon icon="solar:alt-arrow-right-linear" className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
}
