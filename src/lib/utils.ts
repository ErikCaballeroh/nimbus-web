export function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// timeZone: "UTC" keeps these in sync between server and client rendering
// (and correct for date-only values like a task's due date, stored as
// midnight UTC): without it, toLocaleDateString resolves in the runtime's
// local timezone, so the server (UTC in Docker) and a client west of UTC
// can land on different calendar days for the same ISO string, which
// React flags as a hydration mismatch.
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
}

const MOCK_NOW = new Date("2026-09-01T10:00:00").getTime();

export function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.round((MOCK_NOW - then) / 60000);
  if (diff < 1) return "ahora";
  if (diff < 60) return `hace ${diff} min`;
  const h = Math.round(diff / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < new Date("2026-09-01T00:00:00").getTime();
}
