-- ============================================================
-- Database schema: Project Management System (Nimbus)
-- Engine: PostgreSQL 16
-- Kept in sync with prisma/schema.prisma (see CLAUDE.md).
-- ============================================================

-- ---------- Enumerated types ----------

CREATE TYPE project_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_type AS ENUM ('assigned', 'comment', 'status', 'member', 'due');
CREATE TYPE theme AS ENUM ('light', 'dark');

-- ---------- Users ----------

CREATE TABLE users (
    id             UUID PRIMARY KEY,
    name           VARCHAR(120) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    avatar_color   VARCHAR(7) NOT NULL DEFAULT '#4f46e5',   -- hex color, e.g. #4f46e5
    theme          theme NOT NULL DEFAULT 'light',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Password reset tokens ----------

CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- ---------- Projects ----------

CREATE TABLE projects (
    id             UUID PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    color          VARCHAR(7) NOT NULL DEFAULT '#4f46e5',
    start_date     DATE,
    end_date       DATE,
    created_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- ---------- Project members (join table with role) ----------

CREATE TABLE project_members (
    project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role           project_role NOT NULL DEFAULT 'viewer',
    joined_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

-- A project can only have one owner at a time
CREATE UNIQUE INDEX uq_one_owner_per_project
    ON project_members (project_id)
    WHERE role = 'owner';

-- ---------- Tasks ----------

CREATE TABLE tasks (
    id             UUID PRIMARY KEY,
    code           VARCHAR(30) NOT NULL UNIQUE,       -- e.g. "NIM-101"
    project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    status         task_status NOT NULL DEFAULT 'todo',
    priority       task_priority NOT NULL DEFAULT 'medium',
    assignee_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date       DATE,
    created_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now() -- kept current by Prisma's `@updatedAt`, see note 5
);

CREATE INDEX idx_tasks_project_id  ON tasks (project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks (assignee_id);
CREATE INDEX idx_tasks_status      ON tasks (status);
CREATE INDEX idx_tasks_due_date    ON tasks (due_date);

-- ---------- Tags ----------

CREATE TABLE tags (
    id     UUID PRIMARY KEY,
    name   VARCHAR(60) NOT NULL UNIQUE,
    color  VARCHAR(7)
);

CREATE TABLE task_tags (
    task_id  UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id   UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- ---------- Comments ----------

CREATE TABLE comments (
    id          UUID PRIMARY KEY,
    task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    text        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_task_id ON comments (task_id);

-- ---------- Notifications ----------

CREATE TABLE notifications (
    id             UUID PRIMARY KEY,
    recipient_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id        UUID REFERENCES tasks(id) ON DELETE CASCADE,
    type           notification_type NOT NULL,
    text           VARCHAR(255) NOT NULL,
    read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_unread
    ON notifications (recipient_id, read);

-- ============================================================
-- Design notes
-- ============================================================
-- 1. A user's role is stored per project (project_members.role), not on
--    users, because the same person can hold different roles on
--    different projects (the "Add member" form reflects this).
-- 2. tasks.assignee_id does not enforce prior project_members
--    membership at the schema level; "only a project member can be
--    assigned" is validated in the application layer
--    (assertProjectRole / the tasks service), per CLAUDE.md.
-- 3. tags is a global catalog (not per project). If tags should be
--    scoped per project, add project_id to tags and change its
--    UNIQUE constraint to (project_id, name).
-- 4. notifications.actor_id and task_id are nullable because not every
--    notification has a human actor (e.g. "due" reminders) or is tied
--    to a task (e.g. "member").
-- 5. Primary keys have no DB-level default: Prisma Client generates the
--    UUID in the application layer (`@default(uuid())`), so this file
--    has no dependency on the pgcrypto extension.
-- ============================================================
