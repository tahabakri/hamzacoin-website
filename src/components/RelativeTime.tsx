import { formatExact, useRelativeTime } from "../hooks/useRelativeTime";

type Props = {
  timestamp: number;
  className?: string;
};

export function RelativeTime({ timestamp, className }: Props) {
  const text = useRelativeTime(timestamp);
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      title={formatExact(timestamp)}
      aria-label={formatExact(timestamp)}
      className={className}
    >
      {text}
    </time>
  );
}
