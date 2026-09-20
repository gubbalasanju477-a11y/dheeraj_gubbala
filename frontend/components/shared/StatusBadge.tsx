import { Badge } from "@/components/ui/badge";

type Status =
  | "Queued"
  | "Printing"
  | "Completed"
  | "Failed"
  | "Paid"
  | "Pending"
  | "Online"
  | "Offline"
  | "Paused";

const STATUS_MAP: Record<Status, { variant: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  Queued: { variant: "neutral" },
  Printing: { variant: "accent" },
  Completed: { variant: "success" },
  Failed: { variant: "danger" },
  Paid: { variant: "success" },
  Pending: { variant: "warning" },
  Online: { variant: "success" },
  Offline: { variant: "danger" },
  Paused: { variant: "warning" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_MAP[status] ?? { variant: "neutral" as const };
  return (
    <Badge variant={config.variant} dot>
      {status}
    </Badge>
  );
}
