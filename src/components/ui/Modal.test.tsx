import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Título">
        Contenido
      </Modal>,
    );
    expect(screen.queryByText("Título")).toBeNull();
  });

  it("renders the title and children when open", () => {
    render(
      <Modal open onClose={() => {}} title="Título">
        Contenido
      </Modal>,
    );
    expect(screen.getByText("Título")).not.toBeNull();
    expect(screen.getByText("Contenido")).not.toBeNull();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Título">
        Contenido
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Título">
        Contenido
      </Modal>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
