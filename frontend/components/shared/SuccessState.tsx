import { cn } from "@/lib/utils";

export function SuccessState({
  title,
  subtitle,
  className,
  size = "default",
}: {
  title: string;
  subtitle?: string;
  className?: string;
  size?: "default" | "lg";
}) {
  const dim = size === "lg" ? "h-24 w-24" : "h-16 w-16";
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className={cn("relative mb-5 flex items-center justify-center rounded-full bg-success-soft animate-scale-in", dim)}>
        <div className="absolute inset-0 rounded-full animate-pulse-ring" />
        <svg
          viewBox="0 0 52 52"
          className={size === "lg" ? "h-12 w-12" : "h-8 w-8"}
          fill="none"
        >
          <circle cx="26" cy="26" r="24" stroke="#12B76A" strokeOpacity="0.25" strokeWidth="2" />
          <path
            d="M15 27L22.5 34.5L37.5 18"
            stroke="#12B76A"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48"
            className="animate-check-draw"
          />
        </svg>
      </div>
      <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-sm text-sm text-ink-muted">{subtitle}</p>}
    </div>
  );
}
