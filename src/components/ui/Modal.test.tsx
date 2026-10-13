import { useState } from "react";
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

  it("exposes dialog ARIA attributes labelled by the title", () => {
    render(
      <Modal open onClose={() => {}} title="Título">
        Contenido
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe(screen.getByText("Título").id);
  });

  it("moves focus into the dialog when it opens", () => {
    render(
      <Modal open onClose={() => {}} title="Título">
        <button>Acción</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cerrar" }));
  });

  it("restores focus to the trigger element when it closes", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir</button>
          <Modal open={open} onClose={() => setOpen(false)} title="Título">
            Contenido
          </Modal>
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Abrir" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });

  it("traps Tab focus within the dialog", () => {
    render(
      <Modal open onClose={() => {}} title="Título">
        <button>Primero</button>
        <button>Último</button>
      </Modal>,
    );
    const last = screen.getByRole("button", { name: "Último" });
    last.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cerrar" }));
  });
});
