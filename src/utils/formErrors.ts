/**
 * Form validation-error helpers.
 *
 * The backend returns validation problems in the standard envelope:
 *   { success: false, message, errors: [ { field?, message } ], code }
 * These helpers map that into a `{ field: message }` map (for inline, field-level
 * display) and extract a single human message (for the general error banner),
 * so every admin form surfaces errors in the same design-system style.
 */

export type FieldErrors = Record<string, string>;

/** Map the backend `errors: [{ field, message }]` array into `{ field: message }`. */
export const extractFieldErrors = (err: any): FieldErrors => {
  const list = err?.response?.data?.errors ?? err?.errors;
  if (!Array.isArray(list)) return {};
  const map: FieldErrors = {};
  for (const e of list) {
    if (e && typeof e === 'object' && e.field && e.message) {
      map[String(e.field)] = String(e.message);
    }
  }
  return map;
};

/** Best human-readable message from any error shape (for the general banner). */
export const extractMessage = (err: any, fallback = 'Something went wrong. Please check your input and try again.'): string => {
  const d = err?.response?.data;
  if (d?.message) return String(d.message);
  if (Array.isArray(d?.errors) && d.errors.length) {
    const first = d.errors[0];
    if (typeof first === 'string') return first;
    if (first?.message) return first.field ? `${first.field}: ${first.message}` : String(first.message);
  }
  if (err?.errorMessage) return String(err.errorMessage);
  if (err?.message) return String(err.message);
  return fallback;
};
