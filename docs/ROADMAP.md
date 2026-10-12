# Roadmap

Work plan for Claude Code. Each phase is one branch and one pull request. Follow `CLAUDE.md` for conventions (code in English, UI text in Spanish, folder structure, PR format).

## How to run a phase

Give Claude Code this prompt, changing the number:

```
Read CLAUDE.md and the "Phase N" section of docs/ROADMAP.md.
First inspect the current code relevant to this phase and send me a short plan
(files you will create, move or delete). Wait for my OK, then implement it.
Keep commits small. When every item in the phase checklist is done and
lint, typecheck, tests and build pass, open the PR and send me the link. Do not merge.
```

Only start the next phase after the previous PR is merged into `main`.

## Phase overview

| # | Branch | Result |
|---|---|---|
| 0 | `phase-0-tooling` | Lint, typecheck, tests and CI working on the current code |
| 1 | `phase-1-ui-primitives` | Design system split into one component per file, Spanish strings centralized |
| 2 | `phase-2-features-routing` | Screens split by feature, real URLs with App Router, still on mock data |
| 3 | `phase-3-database` | Postgres + Prisma schema, migration and seed |
| 4 | `phase-4-auth` | Register, login, sessions, password recovery, profile settings |
| 5 | `phase-5-projects-members` | Projects, members, roles and permission checks, end to end |
| 6 | `phase-6-tasks` | Board, tasks, tags and comments on real data |
| 7 | `phase-7-notifications-dashboard` | Notifications and dashboard metrics on real data |
| 8 | `phase-8-import-export` | CSV/XLSX import with preview, and export |
| 9 | `phase-9-hardening` | Mock data removed, e2e tests, security pass, docs updated |

Phases 0–2 change structure only: the app must look and behave exactly as before. From phase 4 on, each phase connects its screens to the backend so every PR works end to end.

---

## Phase 0 — Tooling baseline

**Goal**: a safety net before moving any code.

- [ ] Confirm the project runs with `pnpm dev` and `pnpm build`; list anything broken in the PR description instead of fixing it here
- [ ] TypeScript `strict: true`; fix resulting type errors with minimal changes
- [ ] ESLint (`next/core-web-vitals` + `@typescript-eslint`) and Prettier, with `pnpm lint` and `pnpm format`
- [ ] Vitest configured with one trivial passing test; Playwright installed with one smoke test that loads the login page
- [ ] `package.json` scripts listed in `CLAUDE.md` (db scripts may be placeholders until phase 3)
- [ ] GitHub Actions workflow on PRs: install, lint, typecheck, test, build
- [ ] Remove Figma Make leftovers that Next.js does not use (`.figma/`, Vite config, `index.html`, `src/main.tsx`) only if they are confirmed unused
- [ ] `.env.example` created

**Done when**: CI is green on the PR and the app looks unchanged.
**PR title**: `chore: set up linting, testing and CI`

---

## Phase 1 — UI primitives and strings

**Goal**: turn the single `ui.tsx` and `icons.tsx` into a clean design system.

- [ ] Split `ui.tsx` into `components/ui/<Component>.tsx`: Button, IconButton, Field, Input, Textarea, PasswordInput, Select, Toggle, Avatar, AvatarStack, Tag, Progress, Modal, EmptyState, ErrorState, Skeleton, Spinner, Tooltip, Card
- [ ] Move `useClickOutside` to `hooks/useClickOutside.ts`
- [ ] Make primitives domain-free: `Avatar` receives `name` and `color` instead of a `Member`; `PriorityBadge` and `StatusPill` move to `features/tasks/components/` because they know the domain
- [ ] Icons: one `components/ui/Icon.tsx` (or per-icon files) with a typed `name` prop
- [ ] Create `lib/i18n/es.ts` with every user-facing string currently hardcoded, grouped by screen, plus the enum → label maps (priority, status, role, notification type) from `lib/data.ts`
- [ ] Replace hardcoded strings in the moved components with the dictionary
- [ ] Add `components/ui/index.ts` barrel export
- [ ] Unit tests for Button variants, Modal open/close and Field error rendering

**Out of scope**: moving screens or changing routing.
**Done when**: no file in `components/ui` imports from `lib/data` or `features/`, and the app looks identical.
**PR title**: `refactor(ui): split design system into primitives and centralize Spanish strings`

---

## Phase 2 — Feature components and routing

**Goal**: replace the `route` state machine with real URLs and split screens and modals by feature.

- [ ] App Router pages: `/login`, `/register`, `/recover` under `(auth)`; `/dashboard`, `/projects`, `/projects/[projectId]/board`, `/projects/[projectId]/members`, `/team`, `/notifications`, `/settings` (tabs via `?tab=profile|preferences|security`) under `(app)`
- [ ] `(app)/layout.tsx` with `Sidebar` and `Header` in `components/layout/`; active link derived from the URL, page titles from each page
- [ ] Split `Modals.tsx` into `features/projects/components/ProjectFormModal.tsx`, `features/tasks/components/TaskFormModal.tsx`, `TaskDetailModal.tsx`, `features/members/components/AddMemberModal.tsx`, `features/import-export/components/ImportModal.tsx`, `ExportModal.tsx`
- [ ] Split screens into feature components: `Board` → `BoardColumn`, `TaskCard`, `BoardToolbar`; `Projects` → `ProjectsTable`, `ProjectRowMenu`; `Dashboard` → `StatCard`, chart components; `Settings` → one component per tab; `Auth` → `LoginForm`, `RegisterForm`, `RecoverForm`, `AuthShell`
- [ ] Move the `Team` screen out of `App.tsx` into `features/members/components/TeamGrid.tsx`
- [ ] Move types from `lib/data.ts` to `features/*/types.ts`; rename domain values to English codes (`role: "owner" | "admin" | "editor" | "viewer"`) and render them through the i18n maps
- [ ] Keep mock data temporarily in `lib/mock/` behind the existing store. Feature components receive data through props; only page-level components read the store, so phases 5–7 can swap the source without touching presentational components
- [ ] Replace the simulated `setTimeout` loading with `loading.tsx` / `error.tsx` route files using the existing skeletons and `ErrorState`
- [ ] Playwright smoke test: log in (mock), open a project board, open a task

**Out of scope**: backend, database.
**Done when**: every screen has its own URL, browser back/forward works, no component file is longer than ~150 lines, and the app looks identical.
**PR title**: `refactor: organize screens by feature and move to App Router routes`

---

## Phase 3 — Database

**Goal**: database ready with demo data. No UI changes.

- [ ] `docker-compose.yml` with Postgres 16 and `pnpm db:up`
- [ ] Prisma installed; `prisma/schema.prisma` translated from `db/schema.sql` (copy the SQL file from the docs into `db/schema.sql`)
- [ ] Schema adjustments decided during design, applied in Prisma, `db/schema.sql` and the `README.md` tables:
  - [ ] role enum values in English: `owner`, `admin`, `editor`, `viewer`
  - [ ] `users.theme` (`light` | `dark`, default `light`) for `PATCH /me/theme`
  - [ ] new table `password_reset_tokens` (`id`, `user_id` FK cascade, `token_hash` unique, `expires_at`, `used_at` nullable, `created_at`)
- [ ] Initial migration
- [ ] `lib/db.ts` Prisma client singleton (safe for Next.js hot reload)
- [ ] `prisma/seed.ts` recreating the mock users, projects, members, tasks, tags, comments and notifications; all seeded users share the password from `.env.example` (`SEED_PASSWORD`)
- [ ] Integration test setup for Vitest against a test database (separate `DATABASE_URL`)

**Done when**: `pnpm db:up && pnpm db:migrate && pnpm db:seed` works on a clean machine, and `README.md` matches the schema.
**PR title**: `feat(db): add Prisma schema, initial migration and seed`

---

## Phase 4 — Authentication and profile

**Endpoints**: `POST /api/auth/register`, `/login`, `/logout`, `/recover`, `/reset-password`, `GET /api/auth/me`, `PATCH /api/me`, `/api/me/password`, `/api/me/theme`.

- [ ] `lib/auth/`: password hashing, session create/read/destroy (signed httpOnly cookie), `getCurrentUser()` for Server Components and route handlers
- [ ] `lib/api.ts`: response helpers, error mapping to the shape in `CLAUDE.md`, `parseBody(schema)`
- [ ] `middleware.ts`: redirect unauthenticated users from `(app)` to `/login` and authenticated users away from `(auth)`
- [ ] Zod schemas in `features/auth/schemas.ts` shared by forms and handlers (email format, password min 8, confirm match), with Spanish messages
- [ ] Recovery: create a hashed, single-use token valid for 1 hour; in development log the reset link to the console instead of sending email; always answer `200` to avoid revealing which emails exist
- [ ] Add `/reset-password?token=` page
- [ ] Wire Login, Register, Recover and the three Settings tabs to the real endpoints; theme applied from `users.theme` on load
- [ ] Remove the mock "authed" flag
- [ ] Tests: service tests for register (duplicate email → 409), login (wrong password → 401), reset token expiry and reuse; e2e register → logout → login

**Done when**: a new user can register, log in, change name, password and theme, and the session survives a reload.
**PR title**: `feat(auth): add session auth, password recovery and profile settings`

---

## Phase 5 — Projects, members and permissions

**Endpoints**: `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`, `GET/POST /api/projects/:id/members`, `PATCH/DELETE /api/projects/:id/members/:userId`, `GET /api/users?search=`, `GET /api/users/:id`, plus a new `GET /api/team` for the Team screen.

- [ ] `lib/permissions.ts`: role order (`viewer < editor < admin < owner`), `assertProjectRole()`, and the matrix from `README.md` section 3 as code, with unit tests for every row
- [ ] `features/projects/service.ts`: creating a project inserts the creator as `owner` in the same transaction; delete only by owner
- [ ] `features/members/service.ts`: add, change role and remove with these rules: only the owner can grant or remove `owner`; a project always keeps exactly one owner; nobody can remove the owner; users cannot change their own role
- [ ] `GET /api/users?search=` returns at most 10 users by name or email, without sensitive fields
- [ ] `GET /api/team`: users who share at least one project with the current user, with their task and project counts (document it in `README.md`)
- [ ] Wire Projects list, project form (create/edit), delete confirmation, Members screen, Add member modal and Team screen to real data
- [ ] Hide or disable actions the current role cannot perform (the server still enforces them)
- [ ] Tests: permission matrix, owner invariants, a viewer receiving 403 on write endpoints, a non-member receiving 404

**PR title**: `feat(projects): add projects and members API with role-based permissions`

---

## Phase 6 — Tasks, tags and comments

**Endpoints**: `GET/POST /api/projects/:id/tasks`, `GET/PATCH/DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `GET/POST /api/tags`, `PUT /api/tasks/:id/tags`, `GET/POST /api/tasks/:id/comments`, `DELETE /api/comments/:id`.

- [ ] Task code generation (`<PREFIX>-<n>`, sequential per project) safe under concurrent creation
- [ ] Assignee must be a member of the project (validated in the service, `422` otherwise)
- [ ] Filters on the list endpoint: `status`, `assignee`, `priority`
- [ ] Board: drag & drop calls `PATCH /status` with an optimistic update and rollback plus an error toast on failure
- [ ] Task form and detail modal on real data: edit fields, tags (create on the fly), comments list and composer
- [ ] Comment deletion: author with editor role or higher, or any admin/owner
- [ ] Tests: code sequence, assignee validation, status change permissions, comment deletion rules

**PR title**: `feat(tasks): add tasks, tags and comments with Kanban status updates`

---

## Phase 7 — Notifications and dashboard

**Endpoints**: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `GET /api/dashboard/summary`.

- [ ] `features/notifications/service.ts` with `notify()` called from existing services: task assigned (`assigned`), comment on a task you are assigned to or created (`comment`), status change on your task (`status`), added to a project (`member`). Never notify the actor about their own action
- [ ] Notification text built from the i18n dictionary
- [ ] Unread badge in the Sidebar; Notifications screen with filters, toggle read and mark all read
- [ ] Dashboard summary computed in SQL/Prisma aggregates: tasks by status, by priority, overdue and due in the next 7 days, recent activity, projects progress
- [ ] Optional, ask before doing: `due` reminders through a protected `GET /api/cron/due-reminders` (secret header) for a scheduled job
- [ ] Tests: who gets notified for each event, summary numbers against seeded data

**PR title**: `feat(notifications): add notifications and dashboard summary`

---

## Phase 8 — Import and export

**Endpoints**: `POST /api/projects/:id/tasks/import/preview`, `POST /api/projects/:id/tasks/import`, `GET /api/projects/:id/tasks/export?format=csv|xlsx`.

- [ ] Ask before adding the spreadsheet library (suggested: `exceljs` for XLSX, `papaparse` for CSV)
- [ ] Accepted columns, with Spanish headers in the file and English keys in code: `titulo` (required), `descripcion`, `estado`, `prioridad`, `responsable` (email), `fecha_limite` (YYYY-MM-DD), `etiquetas` (comma separated). Map Spanish values (`Alta`, `En progreso`…) to enum codes
- [ ] Limits: 5 MB and 1,000 rows; reject other file types
- [ ] Preview returns each row as `valid` or with its errors in Spanish, without writing
- [ ] Import re-validates on the server and inserts all valid rows in one transaction; returns `{ imported, skipped, errors[] }`
- [ ] Downloadable template file from the Import modal
- [ ] Export from the database (not from the screen), same columns as the import so a file can round-trip
- [ ] Wire the Import and Export modals; editor role or higher
- [ ] Tests: parsing fixtures (valid, missing title, bad date, unknown assignee, wrong extension), round-trip export → import

**PR title**: `feat(import-export): add CSV/XLSX task import with preview and export`

---

## Phase 9 — Cleanup and hardening

- [ ] Delete `lib/mock/` and any remaining mock store; confirm nothing imports it
- [ ] Rate limit `login`, `register` and `recover` per IP
- [ ] Security headers in `next.config` and a review that every route handler authenticates and authorizes
- [ ] Empty, loading and error states checked on every screen
- [ ] Accessibility pass on modals (focus trap, Escape, labels) and the board (keyboard alternative to drag & drop)
- [ ] Playwright flows: register → create project → add member → create task → move it → comment → export
- [ ] `README.md` updated: setup steps, env vars, scripts, final endpoint list, any schema change since phase 3

**PR title**: `chore: remove mocks, harden security and complete e2e coverage`
