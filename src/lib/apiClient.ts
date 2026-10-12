export class ApiClientError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = json?.error;
    throw new ApiClientError(
      err?.code ?? "INTERNAL",
      err?.message ?? "Ha ocurrido un error inesperado.",
      err?.details
    );
  }
  return json as T;
}

/** Maps Zod issues (VALIDATION_ERROR's `details`) to a { fieldName: message } map for form errors. */
export function fieldErrorsFromDetails(details: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(details)) return out;
  for (const issue of details) {
    const path = (issue as { path?: unknown })?.path;
    const message = (issue as { message?: unknown })?.message;
    const key = Array.isArray(path) ? path[0] : undefined;
    if (typeof key === "string" && typeof message === "string" && !(key in out)) {
      out[key] = message;
    }
  }
  return out;
}
