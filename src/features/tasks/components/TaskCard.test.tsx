import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/features/tasks/types";
import { TaskCard } from "./TaskCard";

const task: Task = {
  id: "t1",
  code: "NIM-1",
  title: "Tarea de prueba",
  description: "",
  status: "todo",
  priority: "medium",
  assigneeId: null,
  assignee: null,
  dueDate: null,
  projectId: "p1",
  tags: [],
  commentCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("TaskCard", () => {
  it("is focusable and exposes an accessible name", () => {
    render(<TaskCard task={task} draggable={false} dragging={false} onDragStart={() => {}} onDragEnd={() => {}} onClick={() => {}} />);
    const card = screen.getByRole("button", { name: `${task.code}: ${task.title}` });
    expect(card.tabIndex).toBe(0);
  });

  it("calls onClick when Enter is pressed", () => {
    const onClick = vi.fn();
    render(<TaskCard task={task} draggable={false} dragging={false} onDragStart={() => {}} onDragEnd={() => {}} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Space is pressed", () => {
    const onClick = vi.fn();
    render(<TaskCard task={task} draggable={false} dragging={false} onDragStart={() => {}} onDragEnd={() => {}} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
