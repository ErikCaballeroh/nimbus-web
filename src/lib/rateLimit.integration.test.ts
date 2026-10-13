import { describe, expect, it } from "vitest";
import { ApiError } from "./api";
import { assertRateLimit } from "./rateLimit";

function requestFrom(ip: string): Request {
  return new Request("http://localhost/api/auth/login", { headers: { "x-forwarded-for": ip } });
}

describe("assertRateLimit", () => {
  it("allows the first 5 attempts and rejects the 6th", () => {
    const req = requestFrom("203.0.113.1");
    for (let i = 0; i < 5; i++) {
      expect(() => assertRateLimit(req, "test-allow")).not.toThrow();
    }
    expect(() => assertRateLimit(req, "test-allow")).toThrow(ApiError);
  });

  it("the rejection is a RATE_LIMITED ApiError", () => {
    const req = requestFrom("203.0.113.2");
    for (let i = 0; i < 5; i++) assertRateLimit(req, "test-code");
    try {
      assertRateLimit(req, "test-code");
      throw new Error("expected assertRateLimit to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("RATE_LIMITED");
    }
  });

  it("tracks separate buckets per IP", () => {
    const reqA = requestFrom("203.0.113.3");
    const reqB = requestFrom("203.0.113.4");
    for (let i = 0; i < 5; i++) assertRateLimit(reqA, "test-per-ip");
    expect(() => assertRateLimit(reqA, "test-per-ip")).toThrow(ApiError);
    expect(() => assertRateLimit(reqB, "test-per-ip")).not.toThrow();
  });

  it("tracks separate buckets per action for the same IP", () => {
    const req = requestFrom("203.0.113.5");
    for (let i = 0; i < 5; i++) assertRateLimit(req, "test-action-a");
    expect(() => assertRateLimit(req, "test-action-a")).toThrow(ApiError);
    expect(() => assertRateLimit(req, "test-action-b")).not.toThrow();
  });
});
