import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma";

// Exercises the real Postgres schema (migrations must already be applied to
// DATABASE_URL, see README.md "Running the test suite"). Run with
// `pnpm test:integration`, kept separate from the jsdom unit tests in
// `pnpm test` since it needs a live database.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

afterAll(async () => {
  await prisma.$disconnect();
});

describe("database schema", () => {
  it("round-trips a user through Prisma Client", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Integration Test",
        email: `integration-${Date.now()}@nimbus.test`,
        passwordHash: "not-a-real-hash",
      },
    });

    expect(user.id).toBeTruthy();
    expect(user.theme).toBe("light");
    expect(user.avatarColor).toBe("#4f46e5");

    const found = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(found.email).toBe(user.email);

    await prisma.user.delete({ where: { id: user.id } });
  });

  it("enforces one owner per project", async () => {
    const owner = await prisma.user.create({
      data: { name: "Owner", email: `owner-${Date.now()}@nimbus.test`, passwordHash: "x" },
    });
    const other = await prisma.user.create({
      data: { name: "Other", email: `other-${Date.now()}@nimbus.test`, passwordHash: "x" },
    });
    const project = await prisma.project.create({
      data: { name: "Constraint check", codePrefix: `C${Date.now().toString().slice(-6)}`, createdBy: owner.id },
    });
    await prisma.projectMember.create({
      data: { projectId: project.id, userId: owner.id, role: "owner" },
    });

    await expect(
      prisma.projectMember.create({
        data: { projectId: project.id, userId: other.id, role: "owner" },
      })
    ).rejects.toThrow();

    await prisma.project.delete({ where: { id: project.id } });
    await prisma.user.deleteMany({ where: { id: { in: [owner.id, other.id] } } });
  });
});
