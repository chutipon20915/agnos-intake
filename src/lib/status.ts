import type { DisplayStatus, PatientSessionRow } from "./types";

// ============================================================================
// Derive the status the staff UI displays.
//
// The DB only stores a coarse status ('active' | 'idle' | 'submitted'). The
// richer "is the patient typing right now?" signal is computed here from
// recency + focus + presence, so the same rules are used everywhere.
// ============================================================================

/** A field focused more recently than this reads as "typing". */
export const TYPING_WINDOW_MS = 6_000;
/** Active more recently than this reads as "active", otherwise "idle". */
export const ACTIVE_WINDOW_MS = 25_000;

export interface DeriveOptions {
  /** Field the patient is focused on right now (from the live channel). */
  focusedField?: string | null;
  /** Presence result: true = connected, false = disconnected, undefined = unknown. */
  online?: boolean;
  now?: number;
}

export function deriveStatus(
  row: Pick<PatientSessionRow, "status" | "current_field" | "last_active_at" | "submitted_at">,
  opts: DeriveOptions = {},
): DisplayStatus {
  const now = opts.now ?? Date.now();

  if (row.status === "submitted" || row.submitted_at) return "submitted";

  const sinceActive = now - new Date(row.last_active_at).getTime();
  const focused = opts.focusedField ?? row.current_field;
  const recentTyping = Boolean(focused) && sinceActive < TYPING_WINDOW_MS;

  // When we know presence: an open tab counts as live regardless of idle time,
  // and a closed tab (online === false) is explicitly offline.
  if (opts.online === true) return recentTyping ? "typing" : "active";
  if (opts.online === false) return "offline";

  // Presence unknown → fall back to recency.
  if (recentTyping) return "typing";
  if (sinceActive < ACTIVE_WINDOW_MS) return "active";
  return "idle";
}

export const STATUS_META: Record<
  DisplayStatus,
  { label: string; dot: string; text: string; ring: string; pulse: boolean }
> = {
  typing: {
    label: "Typing…",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    ring: "bg-amber-500/10 ring-amber-500/25",
    pulse: true,
  },
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "bg-emerald-500/10 ring-emerald-500/25",
    pulse: false,
  },
  submitted: {
    label: "Submitted",
    dot: "bg-brand-500",
    text: "text-brand-700 dark:text-brand-300",
    ring: "bg-brand-500/10 ring-brand-500/25",
    pulse: false,
  },
  idle: {
    label: "Idle",
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    ring: "bg-slate-500/10 ring-slate-500/20",
    pulse: false,
  },
  offline: {
    label: "Offline",
    dot: "bg-slate-300",
    text: "text-slate-500 dark:text-slate-500",
    ring: "bg-slate-500/10 ring-slate-500/20",
    pulse: false,
  },
};
