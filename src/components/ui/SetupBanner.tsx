import { AlertTriangle } from "lucide-react";

/**
 * Shown when the Supabase env vars are missing. Keeps the app from crashing and
 * tells the reviewer exactly how to make real-time sync work.
 */
export function SetupBanner() {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">Supabase is not connected yet</p>
          <p className="text-amber-800/90 dark:text-amber-200/80">
            Add <code className="rounded bg-amber-500/15 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-amber-500/15 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="rounded bg-amber-500/15 px-1">.env.local</code>, run{" "}
            <code className="rounded bg-amber-500/15 px-1">supabase/schema.sql</code>, then restart. The UI
            still renders below so you can preview the design.
          </p>
        </div>
      </div>
    </div>
  );
}
