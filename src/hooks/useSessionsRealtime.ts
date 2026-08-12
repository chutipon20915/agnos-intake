"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { ConnectionState } from "@/components/ui/ConnectionIndicator";
import type { PatientSessionRow } from "@/lib/types";

function sortByActive(rows: PatientSessionRow[]): PatientSessionRow[] {
  return [...rows].sort(
    (a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime(),
  );
}

interface PatientPresence {
  id?: string;
}

/**
 * Staff dashboard feed. Two live sources:
 *  - Postgres change-streams (INSERT / UPDATE / DELETE) keep the row data live.
 *  - A shared Presence channel (`presence:patients`) tells us which patients have
 *    the form open *right now*, so "online" doesn't depend on typing activity.
 */
export function useSessionsRealtime() {
  const [rows, setRows] = useState<PatientSessionRow[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("patient_sessions")
        .select("*")
        .order("last_active_at", { ascending: false });
      if (cancelled) return;
      setRows((data as PatientSessionRow[]) ?? []);
      setLoading(false);

      const channel = supabase
        .channel("staff:sessions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "patient_sessions" },
          (payload) => {
            setRows((prev) => {
              if (payload.eventType === "DELETE") {
                return prev.filter((r) => r.id !== (payload.old as PatientSessionRow).id);
              }
              const next = payload.new as PatientSessionRow;
              const exists = prev.some((r) => r.id === next.id);
              const merged = exists
                ? prev.map((r) => (r.id === next.id ? next : r))
                : [next, ...prev];
              return sortByActive(merged);
            });
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") setConnection("connected");
          else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnection("reconnecting");
          else if (status === "CLOSED") setConnection("reconnecting");
        });
      channelRef.current = channel;

      // Track which patients currently have the form open.
      const presence = supabase.channel("presence:patients");
      presence
        .on("presence", { event: "sync" }, () => {
          const state = presence.presenceState<PatientPresence>();
          const ids = new Set<string>();
          for (const entries of Object.values(state)) {
            for (const meta of entries) if (meta.id) ids.add(meta.id);
          }
          setOnlineIds(ids);
        })
        .subscribe();
      presenceRef.current = presence;
    })();

    return () => {
      cancelled = true;
      const supa = getSupabase();
      if (supa && channelRef.current) supa.removeChannel(channelRef.current);
      if (supa && presenceRef.current) supa.removeChannel(presenceRef.current);
      channelRef.current = null;
      presenceRef.current = null;
    };
  }, []);

  return { rows, onlineIds, connection, loading };
}
