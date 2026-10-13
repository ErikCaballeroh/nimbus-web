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

The Docker Postgres is published on host port **5433** (not 5432), so it
doesn't collide with a native Postgres install. If you have an older `.env`
pointing at `localhost:5432`, update both `DATABASE_URL` and
`TEST_DATABASE_URL` to `5433`, then recreate the container with `pnpm db:up`.

### Running the app in Docker

Run `pnpm dev` on the host (above). An optional `app` profile also runs the
dev server inside Docker (`pnpm dev:docker`), but avoid it on Windows/macOS:
with the code bind-mounted through Docker Desktop's file sharing, the initial
file scan is slow and Next.js's dev server can end up with an incomplete route
list, so some route handlers (e.g. `/api/projects/:id/tasks/import/preview`)
intermittently return `404` until restart. The Next.js docs recommend running
`next dev` on the host for the same reason.

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

All routes are under the `/api` prefix. Every handler except the four
marked **public** below requires a valid session (httpOnly cookie);
without one they respond `401 UNAUTHORIZED`. Error responses always use
the shape `{ "error": { "code", "message", "details"? } }` (see
`CLAUDE.md`); validation errors are `422` with Zod issues in `details`.

### Auth (`/api/auth`)

| Method | Path                    | Auth   | Body                                              | Success           |
| ------ | ------------------------ | ------ | -------------------------------------------------- | ------------------ |
| POST   | `/auth/register`        | public | `{ name, email, password, confirmPassword }`      | `201` current user |
| POST   | `/auth/login`           | public | `{ email, password }`                              | `200` current user |
| POST   | `/auth/logout`          | session | —                                                  | `200 { ok: true }` |
| POST   | `/auth/recover`         | public | `{ email }`                                       | `200 { ok: true }` (always, whether or not the email exists) |
| POST   | `/auth/reset-password`  | public | `{ token, password, confirmPassword }`            | `200 { ok: true }`; `422` if the token is invalid, expired or already used |
| GET    | `/auth/me`               | session | —                                                  | `200` current user |

### Profile (`/api/me`)

| Method | Path            | Body                                                | Success             |
| ------ | ---------------- | ------------------------------------------------------ | --------------------- |
| PATCH  | `/me`            | `{ name, email }`                                     | `200` current user; `409` if the email is taken |
| PATCH  | `/me/password`   | `{ currentPassword, newPassword, confirmPassword }` | `200 { ok: true }`; `422` if `currentPassword` is wrong |
| PATCH  | `/me/theme`      | `{ theme: "light" \| "dark" }`                        | `200` current user   |

"Current user" is `{ id, name, email, avatarColor, theme }` — never `passwordHash` or any token.

Password recovery: resetting creates a hashed (SHA-256), single-use
token valid for 1 hour. In development the reset link is logged to the
server console instead of emailed (`[dev] Reset link for <email>: /reset-password?token=...`).

### Projects (`/api/projects`)

| Method | Path                       | Min. role | Body                                                      | Success |
| ------ | --------------------------- | --------- | ----------------------------------------------------------- | -------- |
| GET    | `/projects`                | member    | —                                                           | `200` projects the caller belongs to, with member avatars and task counts |
| POST   | `/projects`                | session   | `{ name, description?, color?, startDate?, endDate? }`    | `201` project; caller becomes `owner` |
| GET    | `/projects/:id`            | viewer    | —                                                           | `200` project |
| PATCH  | `/projects/:id`            | admin     | any subset of the POST body                                | `200` project |
| DELETE | `/projects/:id`            | owner     | —                                                           | `200 { ok: true }` |

Every `:id` route responds `404` when the caller isn't a member (membership is never leaked) and `403` when their role is below the minimum.

### Members (`/api/projects/:id/members`)

| Method | Path                                  | Min. role | Body                      | Success |
| ------ | --------------------------------------- | --------- | --------------------------- | -------- |
| GET    | `/projects/:id/members`                | viewer    | —                           | `200` members with their role, newest last |
| POST   | `/projects/:id/members`                | admin     | `{ userId, role }` (`admin`\|`editor`\|`viewer`) | `201 { ok: true }`; `409` if already a member |
| PATCH  | `/projects/:id/members/:userId`        | admin     | `{ role }` (`owner`\|`admin`\|`editor`\|`viewer`) | `200 { ok: true }` |
| DELETE | `/projects/:id/members/:userId`        | admin     | —                           | `200 { ok: true }` |

Ownership rules (see section 3): only the current owner may set `role: "owner"` (this transfers ownership and demotes them to `admin`); the owner's membership can't otherwise be changed or removed; nobody can change their own role.

### Tasks (`/api/projects/:id/tasks`, `/api/tasks`)

| Method | Path                          | Min. role | Body                                                                 | Success |
| ------ | ------------------------------- | --------- | ----------------------------------------------------------------------- | -------- |
| GET    | `/projects/:id/tasks`           | viewer    | query: `status?`, `assignee?`, `priority?`                              | `200` tasks for the project |
| POST   | `/projects/:id/tasks`           | editor    | `{ title, description?, status?, priority?, assigneeId?, dueDate? }`  | `201` task; `422` if `assigneeId` isn't a project member |
| GET    | `/tasks/:id`                     | viewer    | —                                                                         | `200` task |
| PATCH  | `/tasks/:id`                     | editor    | any subset of the POST body except `status`                             | `200` task |
| DELETE | `/tasks/:id`                     | admin     | —                                                                         | `200 { ok: true }` |
| PATCH  | `/tasks/:id/status`              | editor    | `{ status }`                                                             | `200` task |
| PUT    | `/tasks/:id/tags`                | editor    | `{ tagIds: string[] }` (replaces the full set)                           | `200` task |

Task codes (`NIM-101`) are `<project.codePrefix>-<n>`, assigned when the
task is created; `n` comes from an atomic per-project counter
(`projects.task_seq`), so it stays correct under concurrent creation. The
prefix is derived from the project name once, at project creation, and
never changes.

### Tags (`/api/tags`) and comments (`/api/tasks/:id/comments`, `/api/comments`)

| Method | Path                       | Auth / min. role        | Body              | Success |
| ------ | ---------------------------- | -------------------------- | ------------------- | -------- |
| GET    | `/tags`                      | session                    | —                    | `200` all tags, alphabetical |
| POST   | `/tags`                      | session                    | `{ name, color? }` | `201` tag; `409` if the name is taken |
| GET    | `/tasks/:id/comments`        | viewer (of the task's project) | —               | `200` comments, oldest first |
| POST   | `/tasks/:id/comments`        | editor (of the task's project) | `{ text }`      | `201` comment |
| DELETE | `/comments/:id`              | editor if deleting your own comment, admin otherwise | — | `200 { ok: true }` |

Tags are a global catalog shared by all projects, not scoped per project.

### Import and export (`/api/projects/:id/tasks/import`, `/api/projects/:id/tasks/export`)

| Method | Path                                  | Min. role | Body                            | Success |
| ------ | ----------------------------------------- | --------- | ----------------------------------- | -------- |
| POST   | `/projects/:id/tasks/import/preview`      | editor    | multipart: `file` (`.csv`/`.xlsx`) | `200 { rows, validCount, invalidCount }`, writes nothing |
| POST   | `/projects/:id/tasks/import`              | editor    | multipart: `file` (`.csv`/`.xlsx`) | `200 { imported, skipped, errors: { row, message }[] }` |
| GET    | `/projects/:id/tasks/export`              | editor    | query: `format` (`csv`\|`xlsx`)    | file download, `Content-Disposition: attachment` |

Import columns, in order, with Spanish headers in the file and English keys
in code: `titulo` (required), `descripcion`, `estado`, `prioridad`,
`responsable` (email of a project member), `fecha_limite` (`YYYY-MM-DD`),
`etiquetas` (comma-separated tag names, created on the fly if they don't
exist yet). `estado`/`prioridad` accept the Spanish labels shown in the UI
(`Pendiente`, `En progreso`, `Revisión`, `Completado`; `Baja`, `Media`,
`Alta`, `Urgente`); an unrecognized value is a per-row validation error, not
a silent default.

Files over 5 MB, over 1,000 rows, or with an extension other than `.csv`/
`.xlsx` are rejected outright (`422`) before any row is parsed.

`/import/preview` validates every row (shape, enum values, and whether
`responsable` resolves to an existing user who is a project member) without
writing anything. `/import` re-validates independently from scratch (never
trusts the client's preview result) and inserts every valid row in a single
transaction, reusing the same per-project `task_seq` counter as
`POST /projects/:id/tasks`; a newly-assigned row triggers the same
`assigned` notification as a normal task creation. Rows that fail
validation are skipped and reported in `errors`, keyed by their 1-based row
number (header = row 1).

`/export` reads the project's tasks straight from the database (not from
whatever is currently rendered on the board) and writes the same 7 columns
as import, so an exported file can be re-imported unchanged (round-trip).

A blank template (header row only) is available as a static file at
`/templates/plantilla-tareas.xlsx` / `.csv`, linked from the Import modal.

### Users and team

| Method | Path                | Auth    | Body | Success |
| ------ | --------------------- | ------- | ---- | -------- |
| GET    | `/api/users?search=` | session | —    | `200` up to 10 users matching the query by name or email (`{ id, name, email, avatarColor }`, never `passwordHash`) |
| GET    | `/api/users/:id`     | session | —    | `200` user summary |
| GET    | `/api/team`           | session | —    | `200` users who share at least one project with the caller, each with their total `projectCount` and `taskCount` |

### Notifications (`/api/notifications`)

| Method | Path                            | Auth    | Body | Success |
| ------ | --------------------------------- | ------- | ---- | -------- |
| GET    | `/api/notifications`              | session | —    | `200` up to 100 of the caller's notifications, newest first |
| PATCH  | `/api/notifications/:id/read`     | session | —    | `200 { ok: true }`; `404` if the notification isn't the caller's |
| PATCH  | `/api/notifications/read-all`     | session | —    | `200 { ok: true }`, marks every unread notification of the caller as read |

`features/notifications/service.ts` exports `notify()`, called from the services below (never notifies the actor about their own action):

| Event                                              | Type       | Recipient(s)                          |
| ---------------------------------------------------- | ---------- | ---------------------------------------- |
| A task is created with, or reassigned to, a member   | `assigned` | the new assignee                         |
| A task's status changes                              | `status`   | the task's assignee                      |
| A comment is added to a task                         | `comment`  | the task's assignee and its creator (deduped) |
| A member is added to a project                       | `member`   | the new member                           |
| A task's due date is tomorrow (via the cron below)    | `due`      | the task's assignee                      |

### Dashboard (`/api/dashboard/summary`)

| Method | Path                     | Auth    | Success |
| ------ | -------------------------- | ------- | -------- |
| GET    | `/api/dashboard/summary`   | session | `200` aggregates over the projects the caller belongs to: `activeProjects`, `totalTasks`, `doneTasks`, `overdueTasks`, `dueNext7Days`, `tasksByStatus`, `tasksByPriority`, `projectsProgress` (`{ id, name, total, done }[]`), `upcomingTasks` (the 5 soonest-due incomplete tasks with an `overdue` flag) |

### Cron (`/api/cron/due-reminders`)

| Method | Path                       | Auth                              | Success |
| ------ | ----------------------------- | ------------------------------------ | -------- |
| GET    | `/api/cron/due-reminders`     | `x-cron-secret` header === `CRON_SECRET` | `200 { notified }` |

Meant for a scheduled job (e.g. a daily cron), not a browser: it sends a `due` notification to the assignee of every non-done task whose due date is tomorrow, skipping a task that already got one today so re-running it the same day doesn't duplicate reminders. Set `CRON_SECRET` in `.env` (see `.env.example`); the route 401s without a valid header.

## 3. Roles and permissions

Role order: `viewer` < `editor` < `admin` < `owner`. Checked by `assertProjectRole(userId, projectId, minRole)` in `lib/permissions.ts`, which throws `404` for a non-member and `403` below the minimum.

| Action                  | Minimum role |
| ------------------------ | ------------- |
| View a project           | `viewer`      |
| Edit a project           | `admin`       |
| Delete a project         | `owner`       |
| Add a member             | `admin`       |
| Remove a member          | `admin`       |
| Change a member's role   | `admin`       |
| View tasks / the board    | `viewer`      |
| Create a task             | `editor`      |
| Edit a task                | `editor`      |
| Change a task's status     | `editor`      |
| Delete a task               | `admin`       |
| Create/assign tags         | `editor`      |
| Add a comment               | `editor`      |
| Delete your own comment    | `editor`      |
| Delete someone else's comment | `admin`    |

On top of the minimum-role check, these invariants are enforced in `features/members/service.ts` (not expressible as a single "minimum role"):
- Only the owner can grant or revoke the `owner` role; granting it to someone else transfers ownership and demotes the previous owner to `admin` in the same transaction, so a project always has exactly one owner (also enforced at the database level, see section 4).
- The owner's membership can never be removed.
- Nobody can change their own role.

`features/tasks/service.ts` also validates that a task's `assigneeId`, when set, is a member of the task's project (`422` otherwise) — this isn't expressible as a role check either.

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
| `projects`               | Name, description, color, date range, task-code prefix and counter, creator |
| `project_members`        | Join table: a user's `role` (`owner`/`admin`/`editor`/`viewer`) on a given project; exactly one `owner` per project |
| `tasks`                  | Belongs to a project; status, priority, assignee, due date, code (`NIM-101`) |
| `tags`                   | Global catalog of task labels                                        |
| `task_tags`              | Join table between `tasks` and `tags`                                 |
| `comments`                | Belongs to a task; author and text                                    |
| `notifications`          | Per-recipient activity feed entries (assigned/comment/status/member/due) |

Enums: `project_role`, `task_status`, `task_priority`, `notification_type`, `theme` — see `db/schema.sql` for their values.
