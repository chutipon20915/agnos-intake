"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { FieldDef } from "@/lib/fields";
import type { PatientFormData, PatientFormField } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  field: FieldDef;
  register: UseFormRegister<PatientFormData>;
  errors: FieldErrors<PatientFormData>;
  onValueChange: (field: PatientFormField, value: string) => void;
  onFocusField: (field: PatientFormField) => void;
  onBlurField: () => void;
}

const CONTROL =
  "w-full rounded-lg border bg-surface px-3 pt-2 pb-4 text-sm leading-tight text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500";

export function FormField({
  field,
  register,
  errors,
  onValueChange,
  onFocusField,
  onBlurField,
}: FormFieldProps) {
  const error = errors[field.key]?.message as string | undefined;
  const reg = register(field.key);

  // Spread `reg`, then override change/blur to also fire the live-sync callbacks.
  // (react-hook-form keeps its own state; we layer the realtime broadcast on top.)
  const errorClass = error ? "border-rose-400 focus:ring-rose-500/30" : "";
  const onFocus = () => onFocusField(field.key);

  return (
    <div className={cn("flex flex-col gap-1.5", field.span === 2 && "sm:col-span-2")}>
      <label htmlFor={field.key} className="text-sm font-medium text-ink">
        {field.label}
        {field.required ? (
          <span className="ml-0.5 text-rose-500">*</span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted">optional</span>
        )}
      </label>

      {field.type === "textarea" ? (
        <textarea
          {...reg}
          id={field.key}
          rows={3}
          placeholder={field.placeholder}
          onChange={(e) => {
            reg.onChange(e);
            onValueChange(field.key, e.target.value);
          }}
          onFocus={onFocus}
          onBlur={(e) => {
            reg.onBlur(e);
            onBlurField();
          }}
          className={cn(CONTROL, "resize-y", errorClass)}
        />
      ) : field.type === "select" ? (
        <select
          {...reg}
          id={field.key}
          defaultValue=""
          onChange={(e) => {
            reg.onChange(e);
            onValueChange(field.key, e.target.value);
          }}
          onFocus={onFocus}
          onBlur={(e) => {
            reg.onBlur(e);
            onBlurField();
          }}
          className={cn(CONTROL, errorClass)}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...reg}
          id={field.key}
          type={field.type}
          inputMode={field.type === "tel" ? "tel" : undefined}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          max={field.type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
          onChange={(e) => {
            reg.onChange(e);
            onValueChange(field.key, e.target.value);
          }}
          onFocus={onFocus}
          onBlur={(e) => {
            reg.onBlur(e);
            onBlurField();
          }}
          className={cn(CONTROL, errorClass)}
        />
      )}

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
