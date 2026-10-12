import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders the primary variant by default", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" }).className).toContain("bg-primary");
  });

  it("renders the secondary, ghost and danger variants with distinct styles", () => {
    render(<Button variant="secondary">Secondary</Button>);
    render(<Button variant="ghost">Ghost</Button>);
    render(<Button variant="danger">Danger</Button>);

    expect(screen.getByRole("button", { name: "Secondary" }).className).toContain("border-border-strong");
    expect(screen.getByRole("button", { name: "Ghost" }).className).toContain("hover:bg-secondary");
    expect(screen.getByRole("button", { name: "Danger" }).className).toContain("bg-danger");
  });

  it("fires onClick and respects disabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByRole("button", { name: "Click" }).click();
    expect(onClick).toHaveBeenCalledTimes(1);

    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const disabledButton = screen.getByRole("button", { name: "Disabled" }) as HTMLButtonElement;
    expect(disabledButton.disabled).toBe(true);
  });
});
