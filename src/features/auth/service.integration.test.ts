import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "./service";

function uniqueEmail() {
  return `test-${randomUUID()}@nimbus.test`;
}

afterAll(async () => {
  await db.$disconnect();
});

describe("registerUser", () => {
  it("rejects a duplicate email with a CONFLICT error", async () => {
    const email = uniqueEmail();
    await registerUser({ name: "Ana", email, password: "password123", confirmPassword: "password123" });

    await expect(
      registerUser({ name: "Otra Ana", email, password: "password123", confirmPassword: "password123" })
    ).rejects.toMatchObject({ code: "CONFLICT" } satisfies Partial<ApiError>);
  });
});

describe("loginUser", () => {
  it("rejects a wrong password with UNAUTHORIZED", async () => {
    const email = uniqueEmail();
    await registerUser({ name: "Ana", email, password: "password123", confirmPassword: "password123" });

    await expect(
      loginUser({ email, password: "wrong-password" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" } satisfies Partial<ApiError>);
  });

  it("rejects an unknown email with UNAUTHORIZED", async () => {
    await expect(
      loginUser({ email: uniqueEmail(), password: "whatever123" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" } satisfies Partial<ApiError>);
  });

  it("logs in with the right credentials", async () => {
    const email = uniqueEmail();
    await registerUser({ name: "Ana", email, password: "password123", confirmPassword: "password123" });

    const user = await loginUser({ email, password: "password123" });
    expect(user.email).toBe(email);
  });
});

describe("password reset", () => {
  let email: string;

  beforeEach(async () => {
    email = uniqueEmail();
    await registerUser({ name: "Ana", email, password: "password123", confirmPassword: "password123" });
  });

  it("rejects an unknown token", async () => {
    await expect(
      resetPassword({ token: "not-a-real-token", password: "newpassword123", confirmPassword: "newpassword123" })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" } satisfies Partial<ApiError>);
  });

  it("rejects an expired token", async () => {
    await requestPasswordReset(email);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    const stored = await db.passwordResetToken.findFirstOrThrow({ where: { userId: user.id } });

    // We don't have the raw token (only its hash is stored), so exercise
    // expiry by backdating the row directly instead of waiting an hour.
    await db.passwordResetToken.update({
      where: { id: stored.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    // The raw token never left requestPasswordReset, so reset the hash
    // directly against a known raw token to drive this through the service.
    const rawToken = "expired-token-for-test";
    const { createHash } = await import("node:crypto");
    await db.passwordResetToken.update({
      where: { id: stored.id },
      data: { tokenHash: createHash("sha256").update(rawToken).digest("hex") },
    });

    await expect(
      resetPassword({ token: rawToken, password: "newpassword123", confirmPassword: "newpassword123" })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" } satisfies Partial<ApiError>);
  });

  it("rejects a reused token", async () => {
    const rawToken = "reusable-token-for-test";
    const { createHash } = await import("node:crypto");
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(rawToken).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await resetPassword({ token: rawToken, password: "newpassword123", confirmPassword: "newpassword123" });

    await expect(
      resetPassword({ token: rawToken, password: "anotherpassword123", confirmPassword: "anotherpassword123" })
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" } satisfies Partial<ApiError>);
  });

  it("logs in with the new password after a reset", async () => {
    const rawToken = "working-token-for-test";
    const { createHash } = await import("node:crypto");
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(rawToken).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await resetPassword({ token: rawToken, password: "brandnewpassword123", confirmPassword: "brandnewpassword123" });

    const loggedIn = await loginUser({ email, password: "brandnewpassword123" });
    expect(loggedIn.email).toBe(email);
  });
});
