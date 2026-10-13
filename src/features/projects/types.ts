import type { Role } from "../../lib/permissions";

export interface ProjectMemberSummary {
  id: string;
  name: string;
  avatarColor: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  color: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  myRole: Role;
  members: ProjectMemberSummary[];
  taskCount: number;
  doneTaskCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: string;
  myRole: Role;
}
