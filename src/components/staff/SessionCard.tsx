import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";
import type { PatientSessionRow } from "@/lib/types";
import { ALL_FIELDS, FIELD_LABELS } from "@/lib/fields";
import { deriveStatus } from "@/lib/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, countFilled, displayName, initials, timeAgo } from "@/lib/utils";

const REQUIRED_KEYS = ALL_FIELDS.filter((f) => f.required).map((f) => f.key);

export function SessionCard({ row, now }: { row: PatientSessionRow; now: number }) {
  const status = deriveStatus(row, { now });
  const data = row.form_data ?? {};
  const name = displayName(data);
  const filled = countFilled(data, REQUIRED_KEYS);
  const isTyping = status === "typing" && row.current_field;

  return (
    <Link
      href={`/staff/${row.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
          status === "submitted"
            ? "bg-brand-600"
            : status === "typing"
              ? "bg-amber-500"
              : status === "active"
                ? "bg-emerald-500"
                : "bg-slate-400",
        )}
      >
        {initials(data)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink">{name}</p>
          <StatusBadge status={status} size="sm" />
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span>
            {filled}/{REQUIRED_KEYS.length} required
          </span>
          <span aria-hidden>·</span>
          <span>{status === "submitted" ? `submitted ${timeAgo(row.submitted_at, now)}` : `active ${timeAgo(row.last_active_at, now)}`}</span>
        </div>
        {isTyping && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Pencil className="h-3 w-3" />
            Editing {FIELD_LABELS[row.current_field as keyof typeof FIELD_LABELS] ?? row.current_field}
          </p>
        )}
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
