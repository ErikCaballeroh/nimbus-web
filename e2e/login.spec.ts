import { expect, test } from "@playwright/test";

test("loads the login page", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByPlaceholder("tu@empresa.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});

test("logs in, opens a project board and a task", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.goto("/projects/p1/board");
  await expect(page.getByText("Tablero Kanban")).toBeVisible();

  await page.getByText("Diseñar wireframes").click();
  await expect(page.getByRole("heading", { level: 2, name: "Diseñar wireframes" })).toBeVisible();
});
