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

### Running the app in Docker too

If a host port conflicts with `5432` (e.g. a native Postgres install), run the
Next.js dev server in Docker as well, on the same network as `postgres`:

```bash
pnpm dev:docker            # docker compose --profile app up --build
docker compose exec app pnpm db:migrate
docker compose exec app pnpm db:seed
```

This never touches a host DB port; the app connects to `postgres:5432`
inside the Docker network.

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

### Users and team

| Method | Path                | Auth    | Body | Success |
| ------ | --------------------- | ------- | ---- | -------- |
| GET    | `/api/users?search=` | session | —    | `200` up to 10 users matching the query by name or email (`{ id, name, email, avatarColor }`, never `passwordHash`) |
| GET    | `/api/users/:id`     | session | —    | `200` user summary |
| GET    | `/api/team`           | session | —    | `200` users who share at least one project with the caller, each with their total `projectCount` and `taskCount` |

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

On top of the minimum-role check, these invariants are enforced in `features/members/service.ts` (not expressible as a single "minimum role"):
- Only the owner can grant or revoke the `owner` role; granting it to someone else transfers ownership and demotes the previous owner to `admin` in the same transaction, so a project always has exactly one owner (also enforced at the database level, see section 4).
- The owner's membership can never be removed.
- Nobody can change their own role.

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
