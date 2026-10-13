import { expect, test } from "@playwright/test";

test("register, create project, add member, create task, move it, comment, and export", async ({ page }) => {
  test.setTimeout(180_000);

  const stamp = Date.now();
  const email = `e2e-flow-${stamp}@nimbus.test`;
  const password = "password123";
  const projectName = `Proyecto E2E ${stamp}`;
  const taskTitle = `Tarea E2E ${stamp}`;
  const dragTaskTitle = `Tarea E2E Drag ${stamp}`;
  const importedTaskTitle = `Tarea E2E Importada ${stamp}`;
  const tagName = `etiqueta-e2e-${stamp}`;
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

  // Search and sort on the projects list
  const searchInput = page.getByPlaceholder("Buscar proyectos…");
  await searchInput.fill(projectName.slice(0, 10));
  await expect(page.getByRole("table").getByText(projectName)).toBeVisible();
  await searchInput.fill("");
  await page.getByRole("button", { name: "Progreso", exact: true }).click();
  await page.getByRole("button", { name: "Proyecto", exact: true }).click();
  await expect(page.getByRole("table").getByText(projectName)).toBeVisible();

  // Edit the project via its row menu
  const projectRow = page.getByRole("row", { name: new RegExp(projectName) });
  await projectRow.getByRole("button").click();
  await page.getByRole("button", { name: "Editar" }).click();
  const editDialog = page.getByRole("dialog");
  await editDialog.getByPlaceholder("¿Cuál es el objetivo de este proyecto?").fill("Descripción editada por e2e.");
  await editDialog.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(editDialog).toBeHidden();

  await page.getByRole("table").getByText(projectName).click();
  await expect(page.getByText("Tablero Kanban")).toBeVisible();
  const boardUrl = page.url();

  // Add a member (an existing seeded user), change her role, then remove her
  await page.goto(boardUrl.replace("/board", "/members"));
  await page.getByRole("button", { name: "Añadir miembro" }).click();
  const addMemberDialog = page.getByRole("dialog");
  await addMemberDialog.getByPlaceholder("Buscar por nombre o correo…").fill("Ana García");
  await addMemberDialog.getByText("ana.garcia@nimbus.io").click();
  await addMemberDialog.getByRole("button", { name: "Enviar invitación" }).click();
  await expect(addMemberDialog).toBeHidden();
  await expect(page.getByText("ana.garcia@nimbus.io")).toBeVisible();

  const memberRow = page.getByText("ana.garcia@nimbus.io", { exact: true }).locator("..").locator("..");
  await memberRow.getByRole("button").click();
  await page.getByRole("button", { name: "Administrador" }).click();
  await memberRow.getByRole("button").click();
  await page.getByRole("button", { name: "Quitar del proyecto" }).click();
  await expect(page.getByText("ana.garcia@nimbus.io")).toBeHidden();

  // Create the main task
  await page.goto(boardUrl);
  await page.getByRole("button", { name: "Nueva tarea" }).click();
  const taskDialog = page.getByRole("dialog");
  await taskDialog.getByPlaceholder("Implementar autenticación").fill(taskTitle);
  await taskDialog.getByRole("button", { name: "Crear tarea" }).click();
  await expect(taskDialog).toBeHidden();

  // Open it (mouse), change status and priority, add a tag, comment, then delete the comment
  await page.getByRole("button", { name: taskTitle, exact: false }).click();
  const detailDialog = page.getByRole("dialog");
  await expect(detailDialog.getByRole("heading", { name: taskTitle })).toBeVisible();
  await detailDialog.locator("select").first().selectOption("in_progress");
  await detailDialog.locator("select").nth(1).selectOption("high");
  await detailDialog.getByPlaceholder("Nueva etiqueta…").fill(tagName);
  await detailDialog.getByRole("button", { name: "Añadir" }).click();
  await expect(detailDialog.getByText(tagName)).toBeVisible();
  await detailDialog.getByPlaceholder("Escribe un comentario…").fill(commentText);
  await detailDialog.getByRole("button", { name: "Enviar" }).click();
  await expect(detailDialog.getByText(commentText)).toBeVisible();
  const commentRow = detailDialog.getByText(commentText).locator("..").locator("..");
  await commentRow.getByRole("button").click();
  await expect(detailDialog.getByText(commentText)).toBeHidden();
  await detailDialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(detailDialog).toBeHidden();

  // Reopen it to confirm the status/priority/tag stuck, then delete the task
  await page.getByRole("button", { name: taskTitle, exact: false }).click();
  const reopenedDialog = page.getByRole("dialog");
  await expect(reopenedDialog.locator("select").first()).toHaveValue("in_progress");
  await expect(reopenedDialog.locator("select").nth(1)).toHaveValue("high");
  await expect(reopenedDialog.getByText(tagName)).toBeVisible();
  await reopenedDialog.getByRole("button", { name: "Eliminar tarea" }).click();
  await expect(reopenedDialog).toBeHidden();
  await expect(page.getByRole("button", { name: taskTitle, exact: false })).toBeHidden();

  // Create a second task, open it by keyboard, close with Escape, then drag it to another column
  await page.getByRole("button", { name: "Nueva tarea" }).click();
  const dragTaskDialog = page.getByRole("dialog");
  await dragTaskDialog.getByPlaceholder("Implementar autenticación").fill(dragTaskTitle);
  await dragTaskDialog.getByRole("button", { name: "Crear tarea" }).click();
  await expect(dragTaskDialog).toBeHidden();

  const dragCard = page.getByRole("button", { name: dragTaskTitle, exact: false });
  await dragCard.focus();
  await page.keyboard.press("Enter");
  const keyboardOpenedDialog = page.getByRole("dialog");
  await expect(keyboardOpenedDialog.getByRole("heading", { name: dragTaskTitle })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(keyboardOpenedDialog).toBeHidden();

  const reviewColumn = page.getByText("Revisión", { exact: true }).locator("..").locator("..");
  await dragCard.dragTo(reviewColumn);
  await dragCard.click();
  const dragDetailDialog = page.getByRole("dialog");
  await expect(dragDetailDialog.locator("select").first()).toHaveValue("review");
  await dragDetailDialog.getByRole("button", { name: "Cerrar" }).click();

  // Import: download the template, upload one valid row, confirm, and see the new task
  await page.getByRole("button", { name: "Importar" }).click();
  const importDialog = page.getByRole("dialog");
  const templateDownloadPromise = page.waitForEvent("download");
  await importDialog.getByRole("link", { name: "Descargar plantilla" }).click();
  const templateDownload = await templateDownloadPromise;
  expect(templateDownload.suggestedFilename()).toBe("plantilla-tareas.xlsx");

  const csvContent = `titulo,descripcion,estado,prioridad,responsable,fecha_limite,etiquetas\n${importedTaskTitle},,,,,,`;
  await importDialog.locator('input[type="file"]').setInputFiles({
    name: "tasks.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csvContent),
  });
  await expect(importDialog.getByRole("button", { name: /^Importar \d+ tareas?$/ })).toBeEnabled();
  await importDialog.getByRole("button", { name: /^Importar \d+ tareas?$/ }).click();
  await importDialog.getByRole("button", { name: "Listo" }).click();
  await expect(importDialog).toBeHidden();
  await expect(page.getByText(importedTaskTitle)).toBeVisible();

  // Export: csv and xlsx
  await page.getByRole("button", { name: "Exportar" }).click();
  const exportDialog = page.getByRole("dialog");
  await exportDialog.getByText("CSV", { exact: true }).locator("xpath=ancestor::button[1]").click();
  const csvDownloadPromise = page.waitForEvent("download");
  await exportDialog.getByRole("button", { name: "Exportar" }).click();
  const csvDownload = await csvDownloadPromise;
  expect(csvDownload.suggestedFilename()).toBe("tareas-nimbus.csv");
  await exportDialog.getByRole("button", { name: "Listo" }).click();

  await page.getByRole("button", { name: "Exportar" }).click();
  const exportDialog2 = page.getByRole("dialog");
  await exportDialog2.getByText("Excel", { exact: true }).locator("xpath=ancestor::button[1]").click();
  const xlsxDownloadPromise = page.waitForEvent("download");
  await exportDialog2.getByRole("button", { name: "Exportar" }).click();
  const xlsxDownload = await xlsxDownloadPromise;
  expect(xlsxDownload.suggestedFilename()).toBe("tareas-nimbus.xlsx");
  await exportDialog2.getByRole("button", { name: "Listo" }).click();

  // Clean up: delete the project entirely
  await page.goto("/projects");
  const cleanupRow = page.getByRole("row", { name: new RegExp(projectName) });
  await cleanupRow.getByRole("button").click();
  await page.getByRole("button", { name: "Eliminar" }).click();
  const deleteDialog = page.getByRole("dialog");
  await deleteDialog.getByRole("button", { name: "Eliminar proyecto" }).click();
  await expect(deleteDialog).toBeHidden();
  await page.reload();
  await expect(page.getByText(projectName)).toHaveCount(0);
});
