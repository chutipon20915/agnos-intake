"use client";

import Link from "next/link";
import { ArrowLeft, Circle } from "lucide-react";
import { useSessionDetail } from "@/hooks/useSessionDetail";
import { useNow } from "@/hooks/useNow";
import { FORM_SECTIONS, ALL_FIELDS } from "@/lib/fields";
import { deriveStatus } from "@/lib/status";
import { cn, countFilled, displayName, initials, timeAgo } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConnectionIndicator } from "@/components/ui/ConnectionIndicator";
import { LiveField } from "./LiveField";

const REQUIRED_KEYS = ALL_FIELDS.filter((f) => f.required).map((f) => f.key);

export function SessionDetailView({ id }: { id: string }) {
  const { row, values, focusedField, online, connection, loading, notFound } = useSessionDetail(id);
  const now = useNow(1000);

  if (loading) return <DetailSkeleton />;

  if (notFound || !row) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
        <p className="font-semibold text-ink">Session not found</p>
        <p className="mt-1 text-sm text-muted">It may have been removed or never existed.</p>
        <Link href="/staff" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    );
  }

  const status = deriveStatus(row, { focusedField, online, now });
  const name = displayName(values);
  const filled = countFilled(values, REQUIRED_KEYS);
  const progress = Math.round((filled / REQUIRED_KEYS.length) * 100);

  return (
    <div>
      <Link href="/staff" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      {/* Patient header */}
      <div className="mt-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
                status === "submitted" ? "bg-brand-600" : status === "typing" ? "bg-amber-500" : status === "active" ? "bg-emerald-500" : "bg-slate-400",
              )}
            >
              {initials(values)}
            </span>
            <div>
              <h1 className="text-xl font-bold text-ink sm:text-2xl">{name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Circle className={cn("h-2 w-2 fill-current", online ? "text-emerald-500" : "text-slate-400")} />
                  {online === undefined ? "presence unknown" : online ? "connected" : "disconnected"}
                </span>
              </div>
            </div>
          </div>
          <ConnectionIndicator state={connection} />
        </div>

        {/* Meta + progress */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Meta label="Started" value={timeAgo(row.created_at, now)} />
          <Meta label="Last active" value={timeAgo(row.last_active_at, now)} />
          <Meta label="Submitted" value={row.submitted_at ? timeAgo(row.submitted_at, now) : "—"} />
          <Meta label="Completed" value={`${filled}/${REQUIRED_KEYS.length}`} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Live fields */}
      <div className="mt-5 space-y-5">
        {FORM_SECTIONS.map((section) => (
          <section key={section.id} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink">{section.title}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.fields.map((field) => (
                <LiveField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  focused={focusedField === field.key}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 rounded bg-surface-2" />
      <div className="mt-4 h-40 rounded-2xl border border-border bg-surface" />
      <div className="mt-5 h-64 rounded-2xl border border-border bg-surface" />
    </div>
  );
}
