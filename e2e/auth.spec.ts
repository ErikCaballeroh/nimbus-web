import { expect, test } from "@playwright/test";

test("registers, logs out and logs back in", async ({ page }) => {
  const email = `e2e-${Date.now()}@nimbus.test`;
  const password = "password123";

  await page.goto("/register");
  await page.getByPlaceholder("Ana García").fill("E2E Test User");
  await page.getByPlaceholder("tu@empresa.com").fill(email);
  await page.getByPlaceholder("••••••••").first().fill(password);
  await page.getByPlaceholder("••••••••").last().fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.getByRole("button", { name: "Menú de usuario" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/login");

  // The route is protected again now that the session is gone.
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");

  await page.getByPlaceholder("tu@empresa.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/dashboard");
});
