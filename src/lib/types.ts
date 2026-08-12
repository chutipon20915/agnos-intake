// Shared domain types used by both the patient and staff sides.

/** The shape of the patient form. Keys match the field definitions in fields.ts. */
export interface PatientFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO date string (yyyy-mm-dd)
  gender: string;
  phone: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  religion?: string;
}

export type PatientFormField = keyof PatientFormData;

/** Persisted status stored on the session row. */
export type SessionStatus = "active" | "idle" | "submitted";

/** A session row as stored in Supabase (snake_case, mirrors the SQL schema). */
export interface PatientSessionRow {
  id: string;
  status: SessionStatus;
  form_data: Partial<PatientFormData>;
  current_field: string | null;
  last_active_at: string;
  submitted_at: string | null;
  created_at: string;
}

/**
 * The status the staff UI actually displays. It is *derived* from the row plus
 * live signals (recency, focus, presence) rather than read straight from the DB,
 * so it can distinguish "typing right now" from "was active a moment ago".
 */
export type DisplayStatus = "typing" | "active" | "idle" | "submitted" | "offline";

/** Payloads sent over the per-session realtime broadcast channel. */
export type BroadcastEvent =
  | { type: "field_focus"; field: PatientFormField | null }
  | { type: "field_input"; field: PatientFormField; value: string };
