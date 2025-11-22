import { test, expect } from "@playwright/test";
import { loginViaApi } from "./utils/api-auth";

test.describe("Rubrics Management", () => {
	test.beforeEach(async ({ page }) => {
		const { userId } = await loginViaApi(page); // Use default admin/docente login

		// Ensure there is at least one project
		const response = await page.request.post(
			"http://localhost:5000/api/projects",
			{
				data: {
					name: "E2E Test Project Rubrics",
					description: "Project for E2E tests",
					startDate: new Date().toISOString(),
					endDate: new Date().toISOString(),
					ownerId: userId,
				},
			},
		);
	});

	test("should create, edit and delete a rubric", async ({ page }) => {
		// 1. Go to Rubrics page
		await page.goto("/rubrics");

		// 2. Select a project
		// Wait for the select to appear
		await page.waitForSelector("#project-select");

		// Wait for options to be populated (more than just the default one)
		// We can check the number of options
		await expect(async () => {
			const options = await page.locator("#project-select option").count();
			expect(options).toBeGreaterThan(1);
		}).toPass({ timeout: 10000 });

		const projectSelect = page.locator("#project-select");
		await projectSelect.selectOption({ index: 1 });

		// 3. Create a new Rubric
		// Click on button "+ Nueva Rúbrica"
		const createButton = page.getByRole("button", { name: "+ Nueva Rúbrica" });
		await createButton.waitFor({ state: "visible" });
		await createButton.click();

		await page.fill("#rubric-name", "Test Rubric E2E");
		await page.fill("#rubric-desc", "Description for E2E Test");

		// Fill first criterion
		const firstCriterionName = page.locator(
			'input[id^="criterion-name-"]',
		).first();
		await firstCriterionName.fill("Criterion 1");

		// Add another criterion
		await page.click("text=+ Agregar Criterio");
		const secondCriterionName = page.locator(
			'input[id^="criterion-name-"]',
		).nth(1);
		await secondCriterionName.fill("Criterion 2");

		await page.click('button:has-text("Crear Rúbrica")');

		// Verify creation
		await expect(page.locator("text=Test Rubric E2E")).toBeVisible();
		await expect(page.locator("text=Criterion 1")).toBeVisible();
		await expect(page.locator("text=Criterion 2")).toBeVisible();

		// 4. Edit the Rubric
		// Find the edit button for the created rubric
		const rubricCard = page
			.locator(".bg-white")
			.filter({ hasText: "Test Rubric E2E" });
		await rubricCard.getByRole("button", { name: "Editar" }).click();

		await expect(page.locator("#rubric-name")).toHaveValue("Test Rubric E2E");
		await page.fill("#rubric-name", "Test Rubric E2E Updated");
		await page.click('button:has-text("Guardar Cambios")');

		// Verify update
		await expect(page.locator("text=Test Rubric E2E Updated")).toBeVisible();

		// 5. Delete the Rubric
		page.on("dialog", (dialog) => dialog.accept());
		await rubricCard.getByRole("button", { name: "Eliminar" }).click();

		// Verify deletion
		await expect(
			page.locator("text=Test Rubric E2E Updated"),
		).not.toBeVisible();
	});
});
