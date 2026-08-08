/** دائرة نسبة النتيجة — لون حسب النجاح/الأداء (مقتبس من مرجع al-bayan). */
export function ScoreCircle({ percentage }: { percentage: number }) {
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? "var(--success)"
      : clamped >= 40
        ? "var(--warning)"
        : "var(--destructive)";

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg
        className="h-36 w-36 -rotate-90"
        viewBox="0 0 128 128"
        aria-hidden
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className="absolute text-3xl font-extrabold tabular-nums"
        dir="ltr"
        style={{ color }}
      >
        {Math.round(clamped)}%
      </span>
    </div>
  );
}