# Nimbus

Project management web app: projects, members with per-project roles, a
Kanban board, comments, tags, notifications, a dashboard, and CSV/XLSX
import/export.

See `CLAUDE.md` for stack, conventions and folder structure, and
`docs/ROADMAP.md` for the phased build plan.

## 1. Setup

Requirements: Node 20+, pnpm, Docker (for Postgres).

```bash
cp .env.example .env     # fill in SEED_PASSWORD, leave DATABASE_URL as-is for local dev
pnpm install
pnpm db:up                # starts Postgres in Docker (and a nimbus_test database for tests)
pnpm db:migrate            # applies prisma/migrations to the "nimbus" database
pnpm db:seed                # recreates demo data (users, projects, tasks, tags, comments, notifications)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). All seeded users share the password in `SEED_PASSWORD`.

### Running the test suite

```bash
pnpm test            # unit/component tests (Vitest + jsdom), no database needed
pnpm test:e2e         # Playwright smoke tests
pnpm test:integration # integration tests against TEST_DATABASE_URL (the nimbus_test database)
```

Before the first `pnpm test:integration` run, apply migrations to the test database too:

```bash
DATABASE_URL=$TEST_DATABASE_URL pnpm db:migrate
```

(On Windows PowerShell: `$env:DATABASE_URL=$env:TEST_DATABASE_URL; pnpm db:migrate`.)

## 2. API

Route handlers are added starting Phase 4 of `docs/ROADMAP.md`. This
section will document every endpoint's method, path, request/response
shape and status codes as each phase adds them.

## 3. Roles and permissions

The project role matrix (who can do what per role) is added in Phase 5
of `docs/ROADMAP.md`, alongside `lib/permissions.ts`.

## 4. Database schema

Postgres 16 + Prisma. The source of truth is `prisma/schema.prisma`;
`db/schema.sql` is the plain-SQL mirror, kept in sync by hand for the two
constraints Prisma can't express declaratively (see the migration and
`db/schema.sql`'s design notes): the one-owner-per-project unique index
and the project date-range check.

| Table                   | Purpose                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| `users`                 | Accounts: name, email, password hash, avatar color, theme preference |
| `password_reset_tokens` | Single-use, hashed, time-limited tokens for `/recover` (Phase 4)      |
| `projects`               | Name, description, color, date range, creator                        |
| `project_members`        | Join table: a user's `role` (`owner`/`admin`/`editor`/`viewer`) on a given project; exactly one `owner` per project |
| `tasks`                  | Belongs to a project; status, priority, assignee, due date, code (`NIM-101`) |
| `tags`                   | Global catalog of task labels                                        |
| `task_tags`              | Join table between `tasks` and `tags`                                 |
| `comments`                | Belongs to a task; author and text                                    |
| `notifications`          | Per-recipient activity feed entries (assigned/comment/status/member/due) |

Enums: `project_role`, `task_status`, `task_priority`, `notification_type`, `theme` — see `db/schema.sql` for their values.
