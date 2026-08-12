"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { ConnectionState } from "@/components/ui/ConnectionIndicator";
import type { PatientFormData, PatientFormField } from "@/lib/types";

const DB_DEBOUNCE_MS = 450;

/**
 * Patient-side real-time engine.
 *
 * Two layers of sync (see docs/real-time-flow):
 *  1. Broadcast  — every keystroke + focus is pushed instantly on the
 *     per-session channel `session:{id}` so staff feels the typing live.
 *  2. Postgres   — committed field values are written to the row (debounced)
 *     so the data is durable and survives reconnects / refreshes.
 */
export function useSessionSync() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<RealtimeChannel | null>(null);
  const idRef = useRef<string | null>(null);
  // Accumulates the latest value of every field for the debounced DB write.
  const dataRef = useRef<Partial<PatientFormData>>({});
  const currentFieldRef = useRef<PatientFormField | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  // ---- Session bootstrap + channel subscription --------------------------
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    (async () => {
      // Resume the session named in the URL (?sid=) if it still exists. This lets
      // a patient come back later — even on another device/link — and keep editing.
      const params = new URLSearchParams(window.location.search);
      let id = params.get("sid");
      if (id) {
        const { data } = await supabase
          .from("patient_sessions")
          .select("id, form_data, submitted_at")
          .eq("id", id)
          .maybeSingle();
        if (data) {
          dataRef.current = data.form_data ?? {};
          submittedRef.current = Boolean(data.submitted_at);
        } else {
          id = null; // stale link → start fresh
        }
      }

      // Otherwise create a fresh session.
      if (!id) {
        const { data, error } = await supabase
          .from("patient_sessions")
          .insert({ status: "active", form_data: {} })
          .select("id")
          .single();
        if (error || !data) {
          if (!cancelled) setConnection("error");
          return;
        }
        id = data.id as string;
      }

      if (cancelled) return;
      if (!id) {
        setConnection("error");
        return;
      }
      idRef.current = id;
      setSessionId(id);

      // Keep the session id in the URL so a refresh (or a shared link) resumes it.
      const u = new URL(window.location.href);
      if (u.searchParams.get("sid") !== id) {
        u.searchParams.set("sid", id);
        window.history.replaceState(null, "", u.toString());
      }

      // Per-session channel: presence marks the patient "online", broadcast carries keystrokes.
      const channel = supabase.channel(`session:${id}`, {
        config: { presence: { key: id }, broadcast: { self: false } },
      });
      channel
        .on("presence", { event: "sync" }, () => {})
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setConnection("connected");
            channel.track({ role: "patient", online_at: new Date().toISOString() });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setConnection("reconnecting");
          } else if (status === "CLOSED") {
            setConnection("reconnecting");
          }
        });
      channelRef.current = channel;

      // Global presence channel: lets the staff dashboard know which patients are
      // online *right now* (tab open), independent of typing activity.
      const presence = supabase.channel("presence:patients", {
        config: { presence: { key: id } },
      });
      presence.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          presence.track({ id, online_at: new Date().toISOString() });
        }
      });
      presenceRef.current = presence;
    })();

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const supa = getSupabase();
      if (supa && channelRef.current) supa.removeChannel(channelRef.current);
      if (supa && presenceRef.current) supa.removeChannel(presenceRef.current);
      channelRef.current = null;
      presenceRef.current = null;
    };
  }, []);

  // ---- Debounced durable write -------------------------------------------
  const scheduleWrite = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const supabase = getSupabase();
      const id = idRef.current;
      if (!supabase || !id || submittedRef.current) return;
      await supabase
        .from("patient_sessions")
        .update({
          form_data: dataRef.current,
          current_field: currentFieldRef.current,
          last_active_at: new Date().toISOString(),
          status: "active",
        })
        .eq("id", id);
    }, DB_DEBOUNCE_MS);
  }, []);

  // ---- Public API used by the form ---------------------------------------
  const updateField = useCallback(
    (field: PatientFormField, value: string) => {
      dataRef.current = { ...dataRef.current, [field]: value };
      currentFieldRef.current = field;
      channelRef.current?.send({
        type: "broadcast",
        event: "field_input",
        payload: { type: "field_input", field, value },
      });
      scheduleWrite();
    },
    [scheduleWrite],
  );

  const focusField = useCallback((field: PatientFormField) => {
    currentFieldRef.current = field;
    channelRef.current?.send({
      type: "broadcast",
      event: "field_focus",
      payload: { type: "field_focus", field },
    });
  }, []);

  const blurField = useCallback(() => {
    currentFieldRef.current = null;
    channelRef.current?.send({
      type: "broadcast",
      event: "field_focus",
      payload: { type: "field_focus", field: null },
    });
  }, []);

  const submit = useCallback(async (values: PatientFormData): Promise<boolean> => {
    const supabase = getSupabase();
    const id = idRef.current;
    if (!supabase || !id) return false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    dataRef.current = values;
    const { error } = await supabase
      .from("patient_sessions")
      .update({
        form_data: values,
        status: "submitted",
        current_field: null,
        submitted_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return false;
    submittedRef.current = true;
    channelRef.current?.send({
      type: "broadcast",
      event: "field_focus",
      payload: { type: "field_focus", field: null },
    });
    return true;
  }, []);

  /** Abandon this session and start a brand new one (used by "New patient"). */
  const resetSession = useCallback(() => {
    const u = new URL(window.location.href);
    u.searchParams.delete("sid");
    window.history.replaceState(null, "", u.toString());
  }, []);

  return { sessionId, connection, updateField, focusField, blurField, submit, resetSession };
}
