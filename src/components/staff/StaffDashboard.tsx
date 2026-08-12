"use client";

import { useMemo, useState } from "react";
import { Inbox, Search, Users } from "lucide-react";
import { useSessionsRealtime } from "@/hooks/useSessionsRealtime";
import { useNow } from "@/hooks/useNow";
import { deriveStatus } from "@/lib/status";
import { displayName } from "@/lib/utils";
import type { DisplayStatus } from "@/lib/types";
import { ConnectionIndicator } from "@/components/ui/ConnectionIndicator";
import { SetupBanner } from "@/components/ui/SetupBanner";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SessionCard } from "./SessionCard";
import { cn } from "@/lib/utils";

type Filter = "all" | "live" | "submitted";

export function StaffDashboard() {
  const { rows, connection, loading } = useSessionsRealtime();
  const now = useNow(1000);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const decorated = useMemo(
    () => rows.map((row) => ({ row, status: deriveStatus(row, { now }) })),
    [rows, now],
  );

  const counts = useMemo(() => {
    let live = 0;
    let submitted = 0;
    for (const { status } of decorated) {
      if (status === "submitted") submitted++;
      else if (status === "typing" || status === "active") live++;
    }
    return { total: decorated.length, live, submitted };
  }, [decorated]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return decorated.filter(({ row, status }) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "live" && (status === "typing" || status === "active")) ||
        (filter === "submitted" && status === "submitted");
      const matchesQuery = q === "" || displayName(row.form_data ?? {}).toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [decorated, filter, query]);

  return (
    <div>
      {/* Heading + connection */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Staff dashboard</h1>
          <p className="mt-1.5 text-sm text-muted">Live view of every patient filling in the intake form.</p>
        </div>
        <ConnectionIndicator state={connection} />
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-6">
          <SetupBanner />
        </div>
      )}

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <StatTile label="Total" value={counts.total} tone="ink" />
        <StatTile label="Live now" value={counts.live} tone="emerald" />
        <StatTile label="Submitted" value={counts.submitted} tone="brand" />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(["all", "live", "submitted"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-brand-600 text-white" : "text-muted hover:text-ink",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-5">
        {loading ? (
          <SkeletonList />
        ) : visible.length === 0 ? (
          <EmptyState hasAny={rows.length > 0} />
        ) : (
          <div className="grid gap-3">
            {visible.map(({ row }) => (
              <SessionCard key={row.id} row={row} now={now} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ink" | "emerald" | "brand";
}) {
  const toneClass = {
    ink: "text-ink",
    emerald: "text-emerald-600 dark:text-emerald-400",
    brand: "text-brand-600 dark:text-brand-300",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted sm:text-xs">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums sm:text-3xl", toneClass)}>{value}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-surface-2" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        {hasAny ? <Search className="h-6 w-6" /> : <Inbox className="h-6 w-6" />}
      </span>
      <p className="mt-4 font-semibold text-ink">{hasAny ? "No matches" : "No patients yet"}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        {hasAny ? (
          "Try a different filter or search term."
        ) : (
          <>
            Open the <span className="font-medium text-brand-600 dark:text-brand-300">Patient form</span> in another
            tab and start typing — sessions appear here live.
          </>
        )}
      </p>
      {!hasAny && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted">
          <Users className="h-3.5 w-3.5" /> Waiting for patients…
        </span>
      )}
    </div>
  );
}
