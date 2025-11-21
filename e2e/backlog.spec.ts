import { expect, test } from "@playwright/test";
import { loginAs } from "./utils/auth";

test.describe("Módulo 4: Gestión del Backlog (User Stories)", () => {
	test("Debe permitir crear una historia de usuario con criterios de aceptación", async ({
		page,
	}) => {
		// 1. Login as Admin/Docente
		await loginAs(page, "admin@workflow.com", "admin123");

		// 2. Navigate to User Stories
		await page.getByRole("link", { name: "Historias" }).click();
		await expect(page).toHaveURL(/\/user-stories/);

		// 3. Open Create Modal
		await page.getByRole("button", { name: "+ Nueva Historia" }).click();
		await expect(
			page.getByRole("heading", { name: "Crear Nueva Historia" }),
		).toBeVisible();

		// 4. Fill Form
		const timestamp = Date.now();
		const storyTitle = `Historia Test ${timestamp}`;

		// Select Project (assuming at least one exists, or we create one)
		// For now, we assume a project exists in the dropdown or we pick the first option
		const projectSelect = page.locator("#story-project");
		await projectSelect.waitFor({ state: "visible" });
		await projectSelect.selectOption({ index: 1 }); // Select first available project

		await page.fill("#story-title", storyTitle);
		await page.fill(
			"#story-desc",
			"Descripción de prueba para la historia de usuario",
		);
		await page.fill(
			"#story-acceptance",
			"Dado que tengo permisos, cuando creo una historia, entonces se guarda correctamente.",
		);
		await page.selectOption("#story-priority", "HIGH");

		// 5. Submit
		await page.getByRole("button", { name: "Crear" }).click();

		// 6. Verify it appears in the list
		await expect(page.locator(`text=${storyTitle}`)).toBeVisible();

		// 7. Verify Acceptance Criteria is visible
		await expect(
			page.locator(
				"text=Dado que tengo permisos, cuando creo una historia, entonces se guarda correctamente.",
			),
		).toBeVisible();
	});
});
