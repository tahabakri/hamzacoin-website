import { Icon } from "@iconify/react";

type Step = {
  key: string;
  label: string;
  icon: string;
};

const STEPS: Step[] = [
  { key: "read", label: "Read", icon: "solar:book-2-linear" },
  { key: "quiz", label: "Quiz", icon: "solar:question-circle-linear" },
  { key: "score", label: "Score", icon: "solar:medal-star-linear" },
  { key: "claim", label: "Claim", icon: "solar:hand-money-linear" },
];

type Props = {
  activeIndex: number; // 0..3, -1 if nothing active
};

export function LearnEarnProgressBar({ activeIndex }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {STEPS.map((step, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isActive
                      ? "bg-coffee-700 border-coffee-800 text-white shadow-[0_4px_10px_rgba(67,48,36,0.25)]"
                      : isDone
                        ? "bg-coffee-100 border-coffee-200 text-coffee-700"
                        : "bg-white/60 border-coffee-200 text-coffee-400"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ? (
                    <Icon icon="solar:check-circle-bold" className="text-base" />
                  ) : (
                    <Icon icon={step.icon} className="text-base" />
                  )}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider truncate transition-colors ${
                    isActive ? "text-coffee-950" : isDone ? "text-coffee-700" : "text-coffee-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 sm:mx-3 transition-colors duration-500 ${
                    isDone ? "bg-coffee-600" : "bg-coffee-200"
                  }`}
                  aria-hidden="true"
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
