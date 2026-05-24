type Props = {
  reduceMotion: boolean;
  className?: string;
};

export function CoffeeSteam({ reduceMotion, className }: Props) {
  if (reduceMotion) return null;

  return (
    <svg
      aria-hidden="true"
      width="32"
      height="40"
      viewBox="0 0 32 40"
      className={`pointer-events-none ${className ?? ""}`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path
          className="hmz-steam-wisp"
          style={{ animationDelay: "0s" }}
          d="M9 30 Q 6 22, 9 16 T 9 4"
        />
        <path
          className="hmz-steam-wisp"
          style={{ animationDelay: "0.8s" }}
          d="M16 32 Q 19 24, 16 18 T 16 6"
        />
        <path
          className="hmz-steam-wisp"
          style={{ animationDelay: "1.6s" }}
          d="M23 30 Q 20 22, 23 16 T 23 4"
        />
      </g>
    </svg>
  );
}
