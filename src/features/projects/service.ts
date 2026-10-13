import "server-only";
import { db } from "@/lib/db";
import { assertProjectRole, PROJECT_ACTION_MIN_ROLE } from "@/lib/permissions";
import { getProjectForUser } from "./queries";
import type { Project } from "./types";
import type { CreateProjectInput, UpdateProjectInput } from "./schemas";

// A 3-letter base plus up to a 7-digit suffix still fits VARCHAR(10), so
// this is generous headroom, not just a number that happens to work today.
const MAX_CODE_PREFIX_ATTEMPTS = 1000;

/**
 * Derives a short task-code prefix from the project name (e.g. "Nimbus
 * Launch" -> "NIM"), stable for the project's lifetime (stored on it, see
 * createProject). `attempt` disambiguates a collision with a numeric suffix.
 */
function candidateCodePrefix(name: string, attempt: number): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  const base = (letters.slice(0, 3) || "PRJ").padEnd(3, "X");
  return attempt === 0 ? base : `${base}${attempt}`;
}

function isUniqueConstraintError(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "P2002";
}

export async function createProject(userId: string, input: CreateProjectInput): Promise<Project> {
  // Retrying on the unique constraint (rather than checking availability
  // first, then inserting) avoids a race between two concurrent creations
  // that both pick the same candidate prefix.
  for (let attempt = 0; attempt < MAX_CODE_PREFIX_ATTEMPTS; attempt++) {
    try {
      const project = await db.$transaction(async (tx) => {
        const created = await tx.project.create({
          data: {
            name: input.name,
            description: input.description,
            color: input.color,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            codePrefix: candidateCodePrefix(input.name, attempt),
            createdBy: userId,
          },
        });
        await tx.projectMember.create({
          data: { projectId: created.id, userId, role: "owner" },
        });
        return created;
      });

      return getProjectForUser(userId, project.id);
    } catch (err) {
      if (!isUniqueConstraintError(err) || attempt === MAX_CODE_PREFIX_ATTEMPTS - 1) throw err;
    }
  }
  throw new Error(`Could not generate a unique code prefix for project name "${input.name}".`);
}

export async function updateProject(userId: string, projectId: string, input: UpdateProjectInput): Promise<Project> {
  await assertProjectRole(userId, projectId, PROJECT_ACTION_MIN_ROLE.editProject);

  await db.project.update({
    where: { id: projectId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
      ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
    },
  });

  return getProjectForUser(userId, projectId);
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await assertProjectRole(userId, projectId, PROJECT_ACTION_MIN_ROLE.deleteProject);
  await db.project.delete({ where: { id: projectId } });
}
