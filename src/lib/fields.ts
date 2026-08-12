import type { PatientFormField } from "./types";

// ============================================================================
// Single source of truth for the patient form.
//
// Both the Patient Form (inputs) and the Staff View (read-only live display)
// render from this list, so the two interfaces can never drift out of sync.
// ============================================================================

export type FieldType = "text" | "date" | "tel" | "email" | "textarea" | "select";

export interface FieldDef {
  key: PatientFormField;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  autoComplete?: string;
  options?: string[]; // for `select`
  /** Column span on the desktop 2-col grid (1 or 2). */
  span?: 1 | 2;
}

export interface FieldSection {
  id: string;
  title: string;
  description: string;
  fields: FieldDef[];
}

export const FORM_SECTIONS: FieldSection[] = [
  {
    id: "identity",
    title: "Personal details",
    description: "The patient's legal name and basic identity.",
    fields: [
      { key: "firstName", label: "First name", type: "text", required: true, autoComplete: "given-name", placeholder: "Jane" },
      { key: "middleName", label: "Middle name", type: "text", required: false, autoComplete: "additional-name", placeholder: "Optional" },
      { key: "lastName", label: "Last name", type: "text", required: true, autoComplete: "family-name", placeholder: "Doe" },
      { key: "dateOfBirth", label: "Date of birth", type: "date", required: true, autoComplete: "bday" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        required: true,
        options: ["Female", "Male", "Non-binary", "Other", "Prefer not to say"],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact information",
    description: "How the clinic can reach the patient.",
    fields: [
      { key: "phone", label: "Phone number", type: "tel", required: true, autoComplete: "tel", placeholder: "+66 81 234 5678" },
      { key: "email", label: "Email", type: "email", required: true, autoComplete: "email", placeholder: "jane.doe@email.com" },
      { key: "address", label: "Address", type: "textarea", required: true, span: 2, placeholder: "House no., street, district, city, postal code" },
    ],
  },
  {
    id: "background",
    title: "Background",
    description: "Details that help staff serve the patient better.",
    fields: [
      {
        key: "preferredLanguage",
        label: "Preferred language",
        type: "select",
        required: true,
        options: ["Thai", "English", "Chinese", "Japanese", "Burmese", "Other"],
      },
      { key: "nationality", label: "Nationality", type: "text", required: true, autoComplete: "country-name", placeholder: "Thai" },
      { key: "religion", label: "Religion", type: "text", required: false, placeholder: "Optional" },
    ],
  },
  {
    id: "emergency",
    title: "Emergency contact",
    description: "Optional — someone to reach in an emergency.",
    fields: [
      { key: "emergencyContactName", label: "Contact name", type: "text", required: false, placeholder: "Optional" },
      { key: "emergencyContactRelationship", label: "Relationship", type: "text", required: false, placeholder: "e.g. Spouse, Parent" },
    ],
  },
];

/** Flat list of every field, in display order. */
export const ALL_FIELDS: FieldDef[] = FORM_SECTIONS.flatMap((s) => s.fields);

/** Lookup: field key → human label. */
export const FIELD_LABELS = Object.fromEntries(
  ALL_FIELDS.map((f) => [f.key, f.label]),
) as Record<PatientFormField, string>;

/** Empty form used to seed react-hook-form and new sessions. */
export const EMPTY_FORM = Object.fromEntries(
  ALL_FIELDS.map((f) => [f.key, ""]),
) as Record<PatientFormField, string>;
