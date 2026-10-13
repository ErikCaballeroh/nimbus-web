import { timingSafeEqual } from "node:crypto";
import { apiError, apiOk, errorResponse } from "@/lib/api";
import { sendDueReminders } from "@/features/notifications/service";

function isValidCronSecret(provided: string | null): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Meant for a scheduled job (e.g. a daily cron), not a browser — see README. */
export async function GET(request: Request) {
  try {
    if (!isValidCronSecret(request.headers.get("x-cron-secret"))) {
      return apiError("UNAUTHORIZED", "No autorizado.");
    }

    const result = await sendDueReminders();
    return apiOk(result);
  } catch (err) {
    return errorResponse(err);
  }
}
