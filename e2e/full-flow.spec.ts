import { expect, test } from "@playwright/test";

test("register, create project, add member, create task, move it, comment, and export", async ({ page }) => {
  const stamp = Date.now();
  const email = `e2e-flow-${stamp}@nimbus.test`;
  const password = "password123";
  const projectName = `Proyecto E2E ${stamp}`;
  const taskTitle = `Tarea E2E ${stamp}`;
  const commentText = `Comentario de prueba ${stamp}`;

  // Register
  await page.goto("/register");
  await page.getByPlaceholder("Ana García").fill("E2E Flow User");
  await page.getByPlaceholder("tu@empresa.com").fill(email);
  await page.getByPlaceholder("••••••••").first().fill(password);
  await page.getByPlaceholder("••••••••").last().fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL("/dashboard");

  // Create project
  await page.goto("/projects");
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  const projectDialog = page.getByRole("dialog");
  await projectDialog.getByPlaceholder("Sitio Web Corporativo").fill(projectName);
  await projectDialog.getByRole("button", { name: "Crear proyecto" }).click();
  await expect(projectDialog).toBeHidden();

  await page.getByRole("table").getByText(projectName).click();
  await expect(page.getByText("Tablero Kanban")).toBeVisible();
  const boardUrl = page.url();

  // Add a member (an existing seeded user)
  await page.goto(boardUrl.replace("/board", "/members"));
  await page.getByRole("button", { name: "Añadir miembro" }).click();
  const addMemberDialog = page.getByRole("dialog");
  await addMemberDialog.getByPlaceholder("Buscar por nombre o correo…").fill("Ana García");
  await addMemberDialog.getByText("ana.garcia@nimbus.io").click();
  await addMemberDialog.getByRole("button", { name: "Enviar invitación" }).click();
  await expect(addMemberDialog).toBeHidden();
  await expect(page.getByText("ana.garcia@nimbus.io")).toBeVisible();

  // Create a task
  await page.goto(boardUrl);
  await page.getByRole("button", { name: "Nueva tarea" }).click();
  const taskDialog = page.getByRole("dialog");
  await taskDialog.getByPlaceholder("Implementar autenticación").fill(taskTitle);
  await taskDialog.getByRole("button", { name: "Crear tarea" }).click();
  await expect(taskDialog).toBeHidden();

  // Open it, move it to another status, and comment
  await page.getByRole("button", { name: `${taskTitle}`, exact: false }).click();
  const detailDialog = page.getByRole("dialog");
  await expect(detailDialog.getByRole("heading", { name: taskTitle })).toBeVisible();
  await detailDialog.locator("select").first().selectOption("in_progress");
  await detailDialog.getByPlaceholder("Escribe un comentario…").fill(commentText);
  await detailDialog.getByRole("button", { name: "Enviar" }).click();
  await expect(detailDialog.getByText(commentText)).toBeVisible();
  await detailDialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(detailDialog).toBeHidden();

  // Reopen it to confirm the status move stuck
  await page.getByRole("button", { name: `${taskTitle}`, exact: false }).click();
  const reopenedDialog = page.getByRole("dialog");
  await expect(reopenedDialog.locator("select").first()).toHaveValue("in_progress");
  await reopenedDialog.getByRole("button", { name: "Cerrar" }).click();

  // Export
  await page.getByRole("button", { name: "Exportar" }).click();
  const exportDialog = page.getByRole("dialog");
  await exportDialog.getByRole("button", { name: "CSV .csv", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await exportDialog.getByRole("button", { name: "Exportar" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("tareas-nimbus.csv");
});
