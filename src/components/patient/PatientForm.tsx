"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { FORM_SECTIONS, ALL_FIELDS, EMPTY_FORM } from "@/lib/fields";
import { patientFormSchema } from "@/lib/validation";
import type { PatientFormData } from "@/lib/types";
import { useSessionSync } from "@/hooks/useSessionSync";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";

const REQUIRED_KEYS = ALL_FIELDS.filter((f) => f.required).map((f) => f.key);

export function PatientForm() {
  const { connection, updateField, focusField, blurField, submit, resetSession } = useSessionSync();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: EMPTY_FORM as PatientFormData,
    mode: "onBlur",
  });

  const values = watch();
  const filledRequired = useMemo(
    () => REQUIRED_KEYS.filter((k) => String(values[k] ?? "").trim().length > 0).length,
    [values],
  );
  const progress = Math.round((filledRequired / REQUIRED_KEYS.length) * 100);

  async function onSubmit(data: PatientFormData) {
    setSubmitError(null);
    if (!isSupabaseConfigured) {
      setSubmitError("Connect Supabase (.env.local) to submit — see the banner above.");
      return;
    }
    const ok = await submit(data);
    if (ok) setSubmitted(true);
    else setSubmitError("Something went wrong saving your details. Please try again.");
  }

  function startNew() {
    resetSession();
    reset(EMPTY_FORM as PatientFormData);
    setSubmitted(false);
    setSubmitError(null);
    // Fresh session id is created on reload.
    window.location.reload();
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-ink">Details submitted</h2>
        <p className="mt-2 text-sm text-muted">
          Thank you, {values.firstName || "patient"}. Your information has been sent to the care team.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={startNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <UserPlus className="h-4 w-4" />
            New patient
          </button>
          <Link
            href="/staff"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand-400"
          >
            Open staff view
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Completion</span>
          <span className="text-muted">
            {filledRequired}/{REQUIRED_KEYS.length} required fields
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {FORM_SECTIONS.map((section) => (
          <fieldset key={section.id} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <legend className="px-1 text-base font-semibold text-ink">{section.title}</legend>
            <p className="mb-4 text-sm text-muted">{section.description}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  register={register}
                  errors={errors}
                  onValueChange={updateField}
                  onFocusField={focusField}
                  onBlurField={blurField}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {submitError && (
        <p className="mt-4 rounded-lg border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {submitError}
        </p>
      )}

      {/* Submit */}
      <div className="sticky bottom-4 mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting…" : "Submit details"}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          Staff can already see what you type — no need to submit to preview.{" "}
          <span className={cn("font-medium", connection === "connected" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
            {connection === "connected" ? "Live" : "Connecting…"}
          </span>
        </p>
      </div>
    </form>
  );
}
