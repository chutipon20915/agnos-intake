import { cn } from "@/lib/utils";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

const META: Record<ConnectionState, { label: string; dot: string; text: string }> = {
  connecting: { label: "Connecting", dot: "bg-amber-400", text: "text-muted" },
  connected: { label: "Live", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  reconnecting: { label: "Reconnecting", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  error: { label: "Connection lost", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

/** Small pill showing the realtime connection health. */
export function ConnectionIndicator({
  state,
  className,
}: {
  state: ConnectionState;
  className?: string;
}) {
  const m = META[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium",
        m.text,
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {state !== "error" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", m.dot)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", m.dot)} />
      </span>
      {m.label}
    </span>
  );
}
