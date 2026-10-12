import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import { hashPassword, verifyPassword } from "../../lib/auth/password";
import type { CurrentUser } from "./types";
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from "./schemas";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const userSelect = { id: true, name: true, email: true, avatarColor: true, theme: true } as const;

/** True for a Prisma unique-constraint violation (error code P2002), without depending on the error class export. */
function isUniqueConstraintError(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "P2002";
}

export async function registerUser(input: RegisterInput): Promise<CurrentUser> {
  const passwordHash = await hashPassword(input.password);
  let user: CurrentUser;
  try {
    user = await db.user.create({
      data: { name: input.name, email: input.email, passwordHash },
      select: userSelect,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ApiError("CONFLICT", "Ya existe una cuenta con ese correo.");
    }
    throw err;
  }
  return user;
}

export async function loginUser(input: LoginInput): Promise<CurrentUser> {
  const user = await db.user.findUnique({
    where: { email: input.email },
    select: { ...userSelect, passwordHash: true },
  });
  const ok = user ? await verifyPassword(input.password, user.passwordHash) : false;
  if (!user || !ok) {
    throw new ApiError("UNAUTHORIZED", "Correo o contraseña incorrectos.");
  }
  return { id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor, theme: user.theme };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  // Always resolve the same way, whether or not the email exists.
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[dev] Reset link for ${email}: /reset-password?token=${token}`);
  }
  // TODO: send the reset email in production.
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = createHash("sha256").update(input.token).digest("hex");
  const resetToken = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new ApiError("VALIDATION_ERROR", "El enlace no es válido o ha expirado.");
  }

  const passwordHash = await hashPassword(input.password);
  await db.$transaction([
    db.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<CurrentUser> {
  try {
    return await db.user.update({
      where: { id: userId },
      data: { name: input.name, email: input.email },
      select: userSelect,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ApiError("CONFLICT", "Ya existe una cuenta con ese correo.");
    }
    throw err;
  }
}

export async function updatePassword(userId: string, input: UpdatePasswordInput): Promise<void> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw new ApiError("VALIDATION_ERROR", "La contraseña actual no es correcta.", [
      { path: ["currentPassword"], message: "La contraseña actual no es correcta." },
    ]);
  }
  const passwordHash = await hashPassword(input.newPassword);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function updateTheme(userId: string, theme: "light" | "dark"): Promise<CurrentUser> {
  return db.user.update({ where: { id: userId }, data: { theme }, select: userSelect });
}
