"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldDef } from "@/lib/fields";
import { cn } from "@/lib/utils";

/**
 * Read-only mirror of one patient field on the staff side. Highlights while the
 * patient has it focused and flashes briefly whenever its value changes.
 */
export function LiveField({
  field,
  value,
  focused,
}: {
  field: FieldDef;
  value: string | undefined;
  focused: boolean;
}) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  const mounted = useRef(false);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      if (mounted.current) {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 1000);
        return () => clearTimeout(t);
      }
    }
    mounted.current = true;
  }, [value]);

  const empty = !value || !value.trim();

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        field.span === 2 && "sm:col-span-2",
        focused ? "border-amber-400 ring-2 ring-amber-400/30" : "border-border",
        flash && "field-flash",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{field.label}</span>
        {focused && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            typing
          </span>
        )}
      </div>
      <p className={cn("mt-1 break-words text-sm", empty ? "italic text-muted/50" : "font-medium text-ink")}>
        {empty ? "—" : value}
      </p>
    </div>
  );
}
