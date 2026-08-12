import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/** Brand wordmark. Links home unless `asLink` is false. */
export function Logo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <Activity className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-ink">Agnos Intake</span>
        <span className="text-[11px] font-medium text-muted">Realtime patient portal</span>
      </span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" className="rounded-lg outline-none">
      {inner}
    </Link>
  );
}
