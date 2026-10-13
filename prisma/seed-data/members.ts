import type { MockMember } from "./types";

export const currentUserId = "u1";

export const members: MockMember[] = [
  { id: "u1", name: "Ana García", email: "ana.garcia@nimbus.io", role: "owner", color: "#4f46e5" },
  { id: "u2", name: "Carlos Ruiz", email: "carlos.ruiz@nimbus.io", role: "admin", color: "#0891b2" },
  { id: "u3", name: "Laura Martínez", email: "laura.martinez@nimbus.io", role: "editor", color: "#db2777" },
  { id: "u4", name: "Javier Pérez", email: "javier.perez@nimbus.io", role: "editor", color: "#16a34a" },
  { id: "u5", name: "Sofía Gómez", email: "sofia.gomez@nimbus.io", role: "viewer", color: "#ea580c" },
];

export function memberById(id: string | null): MockMember | undefined {
  return members.find((m) => m.id === id);
}
