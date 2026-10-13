import "server-only";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export class ApiError extends Error {
  code: ApiErrorCode;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(code: ApiErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status: STATUS_BY_CODE[code] }
  );
}

/** Maps a thrown error to the API error shape from CLAUDE.md. */
export function errorResponse(err: unknown) {
  if (err instanceof ApiError) return apiError(err.code, err.message, err.details);
  console.error(err);
  return apiError("INTERNAL", "Ha ocurrido un error inesperado.");
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const json = await request.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", "Revisa los datos del formulario.", result.error.issues);
  }
  return result.data;
}
