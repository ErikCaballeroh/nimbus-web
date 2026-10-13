import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import { currentUserId, members as mockMembers } from "./seed-data/members";
import { projects as mockProjects } from "./seed-data/projects";
import { tasks as mockTasks } from "./seed-data/tasks";
import { notifications as mockNotifications } from "./seed-data/notifications";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

if (!process.env.SEED_PASSWORD) {
  throw new Error("SEED_PASSWORD must be set (see .env.example)");
}
const SEED_PASSWORD: string = process.env.SEED_PASSWORD;

/** Mirrors features/projects/service.ts's candidateCodePrefix (not imported directly: that one retries against the database on collision, which this single-pass seed doesn't need). */
function deriveCodePrefix(name: string, taken: Set<string>): string {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  const base = (letters.slice(0, 3) || "PRJ").padEnd(3, "X");
  for (let suffix = 0; suffix < 100; suffix++) {
    const candidate = suffix === 0 ? base : `${base}${suffix}`;
    if (!taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
  }
  throw new Error(`Could not generate a unique code prefix for project name "${name}".`);
}

async function main() {
  console.log("Resetting existing data...");
  // Order matters: children before parents.
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  console.log("Seeding users...");
  const userIdByMockId = new Map<string, string>();
  for (const m of mockMembers) {
    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        passwordHash,
        avatarColor: m.color,
      },
    });
    userIdByMockId.set(m.id, user.id);
  }
  const mockRoleByMockId = new Map(mockMembers.map((m) => [m.id, m.role]));

  console.log("Seeding projects and members...");
  const projectIdByMockId = new Map<string, string>();
  const codePrefixByProjectId = new Map<string, string>();
  const usedCodePrefixes = new Set<string>();
  for (const p of mockProjects) {
    const codePrefix = deriveCodePrefix(p.name, usedCodePrefixes);
    const project = await prisma.project.create({
      data: {
        name: p.name,
        description: p.description,
        color: p.color,
        startDate: new Date(p.start),
        endDate: new Date(p.end),
        createdAt: new Date(p.createdAt),
        codePrefix,
        createdBy: userIdByMockId.get(currentUserId)!,
      },
    });
    projectIdByMockId.set(p.id, project.id);
    codePrefixByProjectId.set(project.id, codePrefix);

    for (const mockMemberId of p.memberIds) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: userIdByMockId.get(mockMemberId)!,
          // The project creator is always the owner; everyone else keeps
          // their role from the mock directory (admin/editor/viewer).
          role: mockMemberId === currentUserId ? "owner" : mockRoleByMockId.get(mockMemberId)!,
        },
      });
    }
  }

  console.log("Seeding tags...");
  const tagNames = Array.from(new Set(mockTasks.flatMap((t) => t.tags)));
  const tagIdByName = new Map<string, string>();
  for (const name of tagNames) {
    const tag = await prisma.tag.create({ data: { name } });
    tagIdByName.set(name, tag.id);
  }

  console.log("Seeding tasks, comments and tags...");
  const taskSeqByProjectId = new Map<string, number>();
  for (const t of mockTasks) {
    const projectId = projectIdByMockId.get(t.projectId)!;
    const nextSeq = (taskSeqByProjectId.get(projectId) ?? 0) + 1;
    taskSeqByProjectId.set(projectId, nextSeq);

    const task = await prisma.task.create({
      data: {
        code: `${codePrefixByProjectId.get(projectId)!}-${nextSeq}`,
        projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId ? userIdByMockId.get(t.assigneeId)! : null,
        dueDate: new Date(t.due),
        createdBy: userIdByMockId.get(currentUserId)!,
        tags: {
          create: t.tags.map((name) => ({ tagId: tagIdByName.get(name)! })),
        },
      },
    });

    for (const c of t.comments) {
      await prisma.comment.create({
        data: {
          taskId: task.id,
          authorId: userIdByMockId.get(c.authorId)!,
          text: c.text,
          createdAt: new Date(c.time),
        },
      });
    }
  }

  for (const [projectId, taskSeq] of taskSeqByProjectId) {
    await prisma.project.update({ where: { id: projectId }, data: { taskSeq } });
  }

  console.log("Seeding notifications...");
  for (const n of mockNotifications) {
    await prisma.notification.create({
      data: {
        recipientId: userIdByMockId.get(currentUserId)!,
        actorId: userIdByMockId.get(n.actorId)!,
        projectId: n.projectId ? projectIdByMockId.get(n.projectId)! : null,
        type: n.type,
        text: n.text,
        read: n.read,
        createdAt: new Date(n.time),
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
