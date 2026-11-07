// What a Server Action sends back to its form. Safe for client components (types only).
export type FormState = {
  /** Summary at the top of the form. */
  message?: string;
  /** "success" shows a green status box instead of a red alert. */
  tone?: "error" | "success";
  /** One message per field name, shown under the field. */
  errors?: Record<string, string>;
  /** What the user typed (never passwords), so the form keeps it after an error. */
  values?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = {};

/** Reads text fields from FormData; files and missing fields become "". */
export function readFields<K extends string>(
  formData: FormData,
  keys: readonly K[],
): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of keys) {
    const value = formData.get(key);
    out[key] = typeof value === "string" ? value : "";
  }
  return out;
}
