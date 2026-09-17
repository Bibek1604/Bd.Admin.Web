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

/**
 * True when the request reached the server but we stopped waiting for a reply.
 *
 * Kept separate from an unreachable server because the safe advice is opposite:
 * after a timeout the work may have COMPLETED, so retrying can duplicate it.
 */
export const isTimeoutError = (err: any): boolean =>
  !err?.response &&
  (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT' || /timeout/i.test(String(err?.message || '')));

/**
 * True when the reply came from the PROXY rather than from this API — nginx
 * gave up on the upstream, or could not reach it.
 *
 * This matters because the work is still running. nginx's `proxy_read_timeout`
 * (90s in nginx-upload-proxy.conf.sample) fires long before the browser's own
 * timeout on a big bulk import, and when it does, nginx answers 504 with an
 * HTML body. Express never sees it and keeps importing.
 *
 * 502 and 504 always mean the proxy: this API never returns them. 503 is
 * ambiguous — the importer itself answers 503 when it cannot allocate a client
 * ID (bulkClientImport.service.js:78), and that one IS safe to retry because
 * the row was not written. So a 503 only counts as a proxy failure when the
 * body is not one of our JSON envelopes.
 */
const isOurEnvelope = (data: any): boolean =>
  !!data && typeof data === 'object' && ('message' in data || 'success' in data || 'errors' in data);

export const isGatewayError = (err: any): boolean => {
  const status = Number(err?.response?.status);
  if (status === 502 || status === 504) return true;
  return status === 503 && !isOurEnvelope(err?.response?.data);
};

/**
 * True when we genuinely do not know whether the request took effect.
 *
 * Use this — NOT isTimeoutError — to decide whether offering a retry is safe.
 * isTimeoutError alone misses the nginx case entirely: a 504 IS a response, so
 * `!err.response` is false and the caller was told the request had cleanly
 * failed. For bulk import that meant offering to re-run a file the server was
 * still busy writing, and duplicates are not blocked.
 */
export const isOutcomeUnknown = (err: any): boolean => isTimeoutError(err) || isGatewayError(err);

/** Best human-readable message from any error shape (for the general banner). */
export const extractMessage = (err: any, fallback = 'Something went wrong. Please check your input and try again.'): string => {
  const d = err?.response?.data;

  // Checked BEFORE d.message: an nginx 504 carries an HTML body, so every
  // branch below used to fall through to the generic fallback — which reads
  // like a clean failure and invites exactly the retry that duplicates an
  // import. Say what actually happened instead.
  if (isGatewayError(err)) {
    return 'The server did not reply in time. The work may still be running — check the result before trying again.';
  }

  if (d?.message) {
    // A 5xx carries a request id support can search the logs for. Without it,
    // "it failed this morning" is not something anyone can look up.
    const reference = Number(d.code) >= 500 && d.requestId ? ` (reference: ${d.requestId})` : '';
    return `${String(d.message)}${reference}`;
  }
  if (Array.isArray(d?.errors) && d.errors.length) {
    const first = d.errors[0];
    if (typeof first === 'string') return first;
    // The raw field NAME is not prefixed any more — it is a database column
    // ("grandfather_name"), and the message beside it already says the field in
    // plain English. Inline field errors come from extractFieldErrors instead.
    if (first?.message) return String(first.message);
  }
  if (err?.errorMessage) return String(err.errorMessage);

  // Below here there is no response body, so err.message is raw axios text —
  // "timeout of 30000ms exceeded", "Network Error". Never show those.
  if (isTimeoutError(err)) {
    return 'The server is taking longer than expected to respond. Your request may still have gone through — check before trying again.';
  }
  if (!err?.response) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  return fallback;
};
