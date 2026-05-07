import { STATUS_COLORS, STATUS_LABELS } from "@/lib/contract";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: number; className?: string }) {
  const label = STATUS_LABELS[status] ?? "Unknown";
  const color = STATUS_COLORS[status] ?? "bg-slate-100 text-slate-200";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", color, className)}>
      {label}
    </span>
  );
}
