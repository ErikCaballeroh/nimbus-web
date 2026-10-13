import type { Role } from "@/lib/permissions";

export type { Role };

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  joinedAt: string;
}
