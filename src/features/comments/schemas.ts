import { z } from "zod";

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, { error: "El comentario no puede estar vacío." }).max(2000),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
