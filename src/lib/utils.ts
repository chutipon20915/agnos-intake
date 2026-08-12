import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** "just now", "5s ago", "3m ago", "2h ago" — compact relative time. */
export function timeAgo(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "—";
  const diff = Math.max(0, now - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 3) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Count how many of the given keys have a non-empty value. */
export function countFilled(
  data: Record<string, unknown>,
  keys: string[],
): number {
  return keys.filter((k) => {
    const v = data[k];
    return typeof v === "string" ? v.trim().length > 0 : v != null;
  }).length;
}

/** Build a friendly display name from whatever name parts exist so far. */
export function displayName(data: {
  firstName?: string;
  lastName?: string;
}): string {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : "New patient";
}

/** Initials for an avatar chip. */
export function initials(data: { firstName?: string; lastName?: string }): string {
  const a = data.firstName?.trim()?.[0] ?? "";
  const b = data.lastName?.trim()?.[0] ?? "";
  const both = (a + b).toUpperCase();
  return both || "•";
}
