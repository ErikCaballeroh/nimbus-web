import { z } from "zod";

const email = z.email({ error: "Introduce un correo válido." });
const name = z.string().trim().min(2, { error: "Introduce tu nombre." });
const password = z.string().min(8, { error: "Mínimo 8 caracteres." });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Introduce tu contraseña." }),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({ name, email, password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    error: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const recoverSchema = z.object({ email });
export type RecoverInput = z.infer<typeof recoverSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: "Enlace no válido." }),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({ name, email });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Introduce tu contraseña actual." }),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    error: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const updateThemeSchema = z.object({
  theme: z.enum(["light", "dark"], { error: "Tema no válido." }),
});
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
