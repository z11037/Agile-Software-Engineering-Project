/**
 * Human-readable message for failed API calls (axios or network).
 */
export function getApiErrorMessage(err: unknown): string {
  const e = err as {
    response?: { data?: { detail?: unknown }; status?: number };
    message?: string;
  };
  const d = e?.response?.data?.detail;
  if (typeof d === 'string' && d.trim()) return d;
  if (Array.isArray(d) && d.length > 0) {
    const first = d[0] as { msg?: string };
    if (typeof first?.msg === 'string' && first.msg.trim()) return first.msg;
  }
  if (!e?.response) {
    if (e?.message === 'Network Error') {
      return 'Network error. Check your connection and try again.';
    }
    return 'Could not reach the server. Check your connection and try again.';
  }
  const status = e.response.status;
  if (status === 401) return 'Session expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to load this data.';
  if (status === 404) return 'Data was not found.';
  if (status && status >= 500) return 'Server error. Please try again later.';
  return 'Could not load data. Please try again.';
}
