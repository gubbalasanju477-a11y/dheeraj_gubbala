import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-14 text-center", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-bg bg-shimmer bg-[length:800px_100%]",
        className
      )}
    />
  );
}
