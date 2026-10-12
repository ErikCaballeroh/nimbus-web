@AGENTS.md

# CLAUDE.md

Project management web app ("Nimbus"): projects, members with per-project roles, a Kanban board, comments, tags, notifications, a dashboard, and CSV/XLSX import/export.

The phased work plan lives in `docs/ROADMAP.md`. The database and API contract live in `README.md` and `db/schema.sql`. Read the relevant phase in the roadmap before starting any task.

## Stack

- **Next.js (App Router)** + React 19 + TypeScript (`strict: true`)
- **Tailwind CSS v4** with the existing CSS tokens in `app/globals.css` (`--primary`, `--prio-*`, etc.). Do not hardcode colors; use tokens.
- **PostgreSQL** + **Prisma** (schema in `prisma/schema.prisma`, mirrors `db/schema.sql`)
- **Zod** for every input that crosses a boundary (route handler bodies, query params, form data, imported rows)
- **Auth**: session cookie (httpOnly, secure, sameSite=lax) signed with `jose`; passwords hashed with `bcrypt`
- **Recharts** for the dashboard charts
- **Vitest** for unit/integration tests, **Playwright** for a small set of e2e flows
- Package manager: **pnpm**

If something in the repo contradicts this list, stop and ask before changing the stack.

## Language rules

- **All code is in English**: identifiers, file and folder names, types, enum values, DB tables/columns, comments, commit messages, branch names, PR titles and descriptions.
- **All user-facing text is in Spanish**: labels, buttons, placeholders, toasts, validation messages, empty states, page titles, emails.
- User-facing strings live in `lib/i18n/es.ts` (a typed dictionary), never inline in components. Enum → Spanish label maps (priority, status, role, notification type) live there too.
- Domain vocabulary (code → UI): `owner` → Propietario, `admin` → Administrador, `editor` → Editor, `viewer` → Lector; `todo` → Por hacer, `in_progress` → En progreso, `review` → En revisión, `done` → Hecho; `low/medium/high/urgent` → Baja/Media/Alta/Urgente.

## Folder structure

```
app/
  (auth)/                 login, register, recover, reset-password pages + layout
  (app)/                  authenticated area: layout with Sidebar + Header
    dashboard/
    projects/
      [projectId]/
        board/
        members/
    team/
    notifications/
    settings/
  api/                    route handlers only (see "API rules")
components/
  ui/                     design-system primitives, one component per file (Button, Input, Modal, Avatar…)
  layout/                 Sidebar, Header, PageHeader
features/
  <feature>/              auth, projects, members, tasks, comments, tags, notifications, dashboard, import-export
    components/           feature UI (TaskCard, TaskFormModal, BoardColumn…)
    schemas.ts            Zod schemas shared by client forms and route handlers
    service.ts            server-only business logic (DB access, permission checks)
    queries.ts            server-only read functions used by Server Components
    types.ts
lib/
  db.ts                   Prisma client singleton
  auth/                   session, password hashing, getCurrentUser()
  permissions.ts          role matrix + assertProjectRole()
  api.ts                  route-handler helpers (json responses, error mapping, zod parsing)
  i18n/es.ts
  utils.ts
prisma/                   schema.prisma, migrations/, seed.ts
db/schema.sql             reference SQL (kept in sync with Prisma)
docs/ROADMAP.md
```

Rules:
- One exported component per file, file named after the component in PascalCase (`TaskCard.tsx`). Hooks are `useSomething.ts`.
- `components/ui` knows nothing about the domain (no `Task`, no `Project`). Domain-aware components go in `features/*/components`.
- Files that touch the DB or secrets start with `import "server-only";`.
- Prefer named exports. No default exports except Next.js files that require them (`page.tsx`, `layout.tsx`, etc.).
- Keep components under ~150 lines; split when they grow beyond that.

## Data flow rules

- **Reads**: Server Components call `features/*/queries.ts` directly. No fetch to our own API from the server.
- **Writes**: client components call our **route handlers** (`app/api/...`). We do not use Server Actions; the API documented in `README.md` must stay the source of truth.
- After a successful mutation, refresh with `router.refresh()` (or optimistic update for drag & drop on the board, rolling back on error).
- Business rules and permission checks live in `features/*/service.ts`, never in route handlers or components. Route handlers only: authenticate → parse with Zod → call the service → map the result to a response.

## API rules

- Routes and methods follow `README.md` section 2 exactly, under the `/api` prefix (`/api/projects/:id/tasks`).
- Every handler except `/api/auth/register|login|recover|reset-password` requires a session; respond `401` without one.
- Authorization uses the role matrix in `README.md` section 3 through `assertProjectRole(userId, projectId, minRole)`. Respond `403` when the role is insufficient and `404` when the user is not a member (do not leak existence).
- Error shape: `{ "error": { "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL", "message": string, "details"?: unknown } }`. `message` is in Spanish because the UI may show it.
- Validation errors return `422` with Zod issues in `details`.
- Never return `password_hash` or any token. Select fields explicitly.
- Multi-row writes (task import, project creation + owner membership) run in a Prisma transaction.

## Database rules

- Prisma models use camelCase fields mapped to the snake_case columns of `db/schema.sql` (`@map`, `@@map`).
- Any schema change = a new Prisma migration + update `db/schema.sql` + update the tables in `README.md`, all in the same PR.
- Never edit an applied migration. Never run `prisma migrate reset` or drop data without asking.
- `prisma/seed.ts` recreates the demo data that used to live in `lib/data.ts` (the Figma mocks).

## Commands

```
pnpm dev            # dev server
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
pnpm test:e2e       # Playwright
pnpm build
pnpm db:up          # docker compose up -d postgres
pnpm db:migrate     # prisma migrate dev
pnpm db:seed        # prisma db seed
```

Before every commit: `pnpm lint && pnpm typecheck && pnpm test`. Before opening a PR, also `pnpm build`. Do not open a PR with any of these failing.

## Git and PR workflow

- One phase of `docs/ROADMAP.md` = one branch = one PR. Do not start the next phase until the user says the previous PR is merged.
- Branch from an up-to-date `main`: `git checkout main && git pull && git checkout -b phase-<n>-<short-slug>`.
- Conventional Commits in English: `feat(tasks): add status endpoint`, `refactor(ui): split Modals.tsx`, `chore(db): add initial migration`. Small, focused commits.
- Open the PR with `gh pr create --base main` when the phase checklist is done. PR body:
  - **Summary**: what changed and why (2–4 bullets)
  - **Phase checklist**: the phase's items from the roadmap, checked
  - **How to test**: exact commands and the screens to click through
  - **Schema / API changes**: migrations, new or changed endpoints, or "None"
  - **Follow-ups**: anything deferred, with the reason
- After opening the PR, stop and report the PR link. Do not merge it.
- Never force-push to `main`. Never commit `.env` files or secrets; keep `.env.example` updated.

## Things to ask before doing

- Adding a dependency not listed in the stack above.
- Changing the DB schema or the API contract beyond what the current phase describes.
- Changing visual design (spacing, colors, layout). Refactors must be visually identical unless the phase says otherwise.
- Deleting files that are not clearly replaced by the refactor.