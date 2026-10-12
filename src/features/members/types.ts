export type Role = "owner" | "admin" | "editor" | "viewer";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string;
}
