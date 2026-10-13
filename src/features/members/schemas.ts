import { z } from "zod";

// A new member is always added as admin/editor/viewer — a project already
// has exactly one owner from creation, so "owner" isn't a valid add-time role.
const addableRole = z.enum(["admin", "editor", "viewer"], { error: "Rol no válido." });

export const addMemberSchema = z.object({
  userId: z.uuid({ error: "Usuario no válido." }),
  role: addableRole,
});
export type AddMemberInput = z.infer<typeof addMemberSchema>;

// "owner" is a valid target here: setting it is how ownership is
// transferred (owner-only, handled in the service layer).
const changeableRole = z.enum(["owner", "admin", "editor", "viewer"], { error: "Rol no válido." });

export const changeMemberRoleSchema = z.object({ role: changeableRole });
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
