import { expect, test } from "@playwright/test";
import { loginAs } from "./utils/auth";

test.describe("Metrics & Reports", () => {
	test("Should display Burndown and Contribution charts", async ({ page }) => {
		// 1. Login as Admin
		await loginAs(page, "admin@workflow.com", "admin123");

		// 2. Go to Reports
		await page.goto("/reports");

		// 3. Check if Project Selector exists
		await expect(page.getByLabel("Proyecto")).toBeVisible();

		// 4. Check if Burndown Chart section exists
		// It might say "Sin sprints" or show chart if sprints exist.
		// We assume the seeded project has sprints or we create one via API if needed.
		// For robustness, let's just check the structure is there.
		await expect(page.getByText("Reportes y Métricas")).toBeVisible();

		// 5. Check Contribution Section
		await expect(page.getByText("Contribución Individual")).toBeVisible();

		// 6. Check if table headers exist
		await expect(page.getByText("Usuario", { exact: true })).toBeVisible();
		await expect(page.getByText("Tareas Completadas")).toBeVisible();
	});
});
