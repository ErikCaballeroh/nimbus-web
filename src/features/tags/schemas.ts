import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }).max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { error: "Color no válido." })
    .optional(),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;
