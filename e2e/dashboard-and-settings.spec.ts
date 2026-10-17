import { expect, test } from "@playwright/test";

const SEED_PASSWORD = process.env.SEED_PASSWORD;
if (!SEED_PASSWORD) throw new Error("SEED_PASSWORD must be set (see .env.example) to run e2e tests");

test("dashboard, team, notifications, settings and header widgets", async ({ page }) => {
  test.setTimeout(60_000);

  // Log in as a seeded user to see dashboard/team/notifications with real
  // pre-existing data — read-only here, so no risk of racing other specs
  // that also log in as her.
  await page.goto("/login");
  await page.getByPlaceholder("tu@empresa.com").fill("ana.garcia@nimbus.io");
  await page.getByPlaceholder("••••••••").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL("/dashboard");

  // Dashboard: KPI cards, chart, activity
  await expect(page.getByText("Proyectos activos")).toBeVisible();
  await expect(page.getByText("Tareas totales")).toBeVisible();
  await expect(page.getByText("Completadas")).toBeVisible();
  await expect(page.getByText("Atrasadas")).toBeVisible();

  // Team
  await page.goto("/team");
  await expect(page.getByText("tareas").first()).toBeVisible();
  await expect(page.getByText("proyectos").first()).toBeVisible();

  // Notifications: view, filter, mark one read, mark all read
  await page.goto("/notifications");
  await page.getByRole("button", { name: "No leídas", exact: true }).click();
  await page.getByRole("button", { name: "Todas", exact: true }).click();
  const markOneRead = page.getByTitle("Marcar como leída").first();
  if (await markOneRead.count()) await markOneRead.click();
  const markAllButton = page.getByRole("button", { name: "Marcar todas como leídas" });
  if (await markAllButton.isEnabled()) await markAllButton.click();

  await page.getByRole("button", { name: "Menú de usuario" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/login");

  // Switch to a throwaway account for everything that mutates account state
  // (name, theme, password) so there is no shared state to race with other
  // specs that log in as the seeded user.
  const stamp = Date.now();
  const email = `e2e-settings-${stamp}@nimbus.test`;
  const password = "password123";
  await page.goto("/register");
  await page.getByPlaceholder("Ana García").fill("E2E Settings User");
  await page.getByPlaceholder("tu@empresa.com").fill(email);
  await page.getByPlaceholder("••••••••").first().fill(password);
  await page.getByPlaceholder("••••••••").last().fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL("/dashboard");

  // Settings: profile (edit name), preferences (theme), security (change password)
  await page.goto("/settings?tab=profile");
  await page.getByLabel("Nombre completo").fill("E2E Settings User Editado");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Cambios guardados ✓")).toBeVisible();

  await page.goto("/settings?tab=preferences");
  const wasDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));
  await page.getByText(wasDark ? "Claro" : "Oscuro", { exact: true }).click();
  await expect(page.locator("html")).toHaveClass(wasDark ? /(?!.*dark)/ : /dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(wasDark ? /(?!.*dark)/ : /dark/);

  await page.goto("/settings?tab=security");
  await page.getByLabel("Contraseña actual").fill(password);
  await page.getByLabel(/^Nueva contraseña/).fill("otra-password-456");
  await page.getByLabel("Confirmar nueva contraseña").fill("otra-password-456");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(page.getByText("Contraseña actualizada ✓")).toBeVisible();

  // Header: notification bell dropdown, theme toggle
  await page.goto("/dashboard");
  async function clickThemeToggle() {
    const isDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));
    const tooltipLabel = isDark ? "Modo claro" : "Modo oscuro";
    await page.getByText(tooltipLabel, { exact: true }).locator("xpath=preceding-sibling::button[1]").click();
  }
  await clickThemeToggle();
  await clickThemeToggle();

  const bellButton = page
    .locator('header div[class="relative"]')
    .filter({ has: page.locator("svg") })
    .getByRole("button");
  await bellButton.click();
  await expect(page.getByText("Notificaciones", { exact: true })).toBeVisible();
  await bellButton.click();

  // Logout
  await page.getByRole("button", { name: "Menú de usuario" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/login");
});
