import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// ============================================================================
// Form validation schema (zod). Used by react-hook-form on the patient side.
// Kept in one place so validation rules are documented and testable.
// ============================================================================

/**
 * Accepts either an international number (+66...) or a local number that is
 * valid for Thailand (the clinic's default region). libphonenumber handles the
 * real-world edge cases so we don't ship a brittle regex.
 */
function isValidPhone(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  try {
    return isValidPhoneNumber(v) || isValidPhoneNumber(v, "TH");
  } catch {
    return false;
  }
}

const requiredText = (label: string) =>
  z.string().trim().min(1, { message: `${label} is required` });

export const patientFormSchema = z.object({
  firstName: requiredText("First name"),
  middleName: z.string().trim().optional(),
  lastName: requiredText("Last name"),
  dateOfBirth: requiredText("Date of birth").refine(
    (v) => {
      const d = new Date(v);
      return !Number.isNaN(d.getTime()) && d <= new Date();
    },
    { message: "Enter a valid date of birth in the past" },
  ),
  gender: requiredText("Gender"),
  phone: requiredText("Phone number").refine(isValidPhone, {
    message: "Enter a valid phone number",
  }),
  email: requiredText("Email").email({ message: "Enter a valid email address" }),
  address: requiredText("Address"),
  preferredLanguage: requiredText("Preferred language"),
  nationality: requiredText("Nationality"),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactRelationship: z.string().trim().optional(),
  religion: z.string().trim().optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
