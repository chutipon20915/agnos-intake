"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { ConnectionState } from "@/components/ui/ConnectionIndicator";
import type { PatientFormData, PatientFormField, PatientSessionRow } from "@/lib/types";

interface PresenceMeta {
  role?: string;
}

/**
 * Staff-side live view of a single session. Combines three real-time sources:
 *  - Postgres changes  → durable, committed field values + status (source of truth)
 *  - Broadcast         → instant per-keystroke values + which field has focus
 *  - Presence          → is the patient still connected right now?
 *
 * The broadcast overlay is merged *on top of* the durable row, so the display
 * is both instant (broadcast) and correct after reconnects (Postgres).
 */
export function useSessionDetail(id: string) {
  const [row, setRow] = useState<PatientSessionRow | null>(null);
  const [liveValues, setLiveValues] = useState<Partial<PatientFormData>>({});
  const [focusedField, setFocusedField] = useState<PatientFormField | null>(null);
  const [online, setOnline] = useState<boolean | undefined>(undefined);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

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
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setRow(data as PatientSessionRow);
      setLoading(false);

      const staffKey = `staff-${crypto.randomUUID()}`;
      const channel = supabase.channel(`session:${id}`, {
        config: { presence: { key: staffKey }, broadcast: { self: false } },
      });

      channel
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "patient_sessions", filter: `id=eq.${id}` },
          (payload) => {
            if (payload.eventType === "DELETE") {
              setNotFound(true);
              return;
            }
            setRow(payload.new as PatientSessionRow);
          },
        )
        .on("broadcast", { event: "field_input" }, ({ payload }) => {
          const p = payload as { field: PatientFormField; value: string };
          setLiveValues((prev) => ({ ...prev, [p.field]: p.value }));
          setFocusedField(p.field);
        })
        .on("broadcast", { event: "field_focus" }, ({ payload }) => {
          const p = payload as { field: PatientFormField | null };
          setFocusedField(p.field);
        })
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<PresenceMeta>();
          const patientHere = Object.values(state)
            .flat()
            .some((m) => m.role === "patient");
          setOnline(patientHere);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setConnection("connected");
            channel.track({ role: "staff" });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setConnection("reconnecting");
          } else if (status === "CLOSED") {
            setConnection("reconnecting");
          }
        });

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      const supa = getSupabase();
      if (supa && channelRef.current) supa.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [id]);

  // Durable values first, live keystrokes layered on top.
  const values = useMemo<Partial<PatientFormData>>(
    () => ({ ...(row?.form_data ?? {}), ...liveValues }),
    [row?.form_data, liveValues],
  );

  return { row, values, focusedField, online, connection, loading, notFound };
}
