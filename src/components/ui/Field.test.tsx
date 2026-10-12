import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  it("renders the label and children", () => {
    render(
      <Field label="Correo electrónico">
        <input />
      </Field>,
    );
    expect(screen.getByText("Correo electrónico")).not.toBeNull();
  });

  it("renders the hint when there is no error", () => {
    render(
      <Field label="Correo" hint="Usa tu correo de trabajo">
        <input />
      </Field>,
    );
    expect(screen.getByText("Usa tu correo de trabajo")).not.toBeNull();
  });

  it("renders the error instead of the hint when both are given", () => {
    render(
      <Field label="Correo" hint="Usa tu correo de trabajo" error="Correo no válido">
        <input />
      </Field>,
    );
    expect(screen.getByText("Correo no válido")).not.toBeNull();
    expect(screen.queryByText("Usa tu correo de trabajo")).toBeNull();
  });
});
