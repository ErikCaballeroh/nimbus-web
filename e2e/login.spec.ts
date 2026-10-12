import { expect, test } from "@playwright/test";

test("loads the login page", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByPlaceholder("tu@empresa.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});
