import { expect, test } from "@playwright/test";

const SEED_PASSWORD = process.env.SEED_PASSWORD;
if (!SEED_PASSWORD) throw new Error("SEED_PASSWORD must be set (see .env.example) to run e2e tests");

test("loads the login page", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByPlaceholder("tu@empresa.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});

test("logs in, opens a project board and a task", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("tu@empresa.com").fill("ana.garcia@nimbus.io");
  await page.getByPlaceholder("••••••••").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.goto("/projects");
  await page.getByRole("table").getByText("Sitio Web Corporativo").click();
  await expect(page.getByText("Tablero Kanban")).toBeVisible();

  await page.getByText("Diseñar wireframes").click();
  await expect(page.getByRole("heading", { level: 2, name: "Diseñar wireframes" })).toBeVisible();
});
