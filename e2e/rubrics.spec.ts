import { expect, test } from "@playwright/test";
import { loginAs } from "./utils/auth";

test.describe("Evaluations & Rubrics", () => {
	test("Should allow evaluation with a Rubric", async ({ page, request }) => {
		// 1. Setup: Create a Project, Rubric, and Task via API (to save time/robustness)
		//    We need an admin user. Assuming "admin@workflow.com" / "admin123" exists from seed.

		// Login first to get session/cookies if needed, or use API context if setup allows.
		// For E2E, we usually interact via UI, but setting up data via API is cleaner.
		// Let's do a mix: UI for the test action, API for setup.

		// Login
		await loginAs(page, "admin@workflow.com", "admin123");

		// Create a Rubric via API (since we didn't build a Rubric UI yet, only Evaluation UI)
		// We need a project ID. Let's grab the first one from the UI or API.
		const projectsRes = await page.request.get(
			"http://localhost:3001/api/projects?memberId=admin-id-placeholder",
		);
		// Actually simpler to just assume the seeded project exists or fetch via UI interception.
		// Let's go to Projects page and click one.
		await page.goto("/projects");
		await page.getByRole("link", { name: "Ver detalles" }).first().click();

		// Get Project ID from URL
		const url = page.url();
		const projectId = url.split("/").pop();
		expect(projectId).toBeTruthy();

		// Create Rubric via API
		const rubricRes = await page.request.post(
			"http://localhost:3001/api/rubrics",
			{
				data: {
					projectId: projectId,
					name: `Rubrica Test ${Date.now()}`,
					description: "Rúbrica de prueba e2e",
					criteria: [
						{ name: "Calidad de Código", maxScore: 10, weight: 2 },
						{ name: "Documentación", maxScore: 5, weight: 1 },
					],
				},
			},
		);
		expect(rubricRes.ok()).toBeTruthy();

		// Ensure there is a COMPLETED task to evaluate.
		// Create task via API
		const taskRes = await page.request.post("http://localhost:3001/api/tasks", {
			data: {
				title: `Tarea Evaluable ${Date.now()}`,
				description: "Tarea para probar evaluación",
				projectId: projectId,
				status: "COMPLETED", // Directly completed for testing
			},
		});
		expect(taskRes.ok()).toBeTruthy();
		const taskData = await taskRes.json();

		// 2. Go to Evaluations Page
		await page.goto("/evaluations");

		// 3. Select the Task
		await page.getByText(taskData.title).click();

		// 4. Verify Rubric Form appears
		await expect(page.getByLabel("Seleccionar Rúbrica")).toBeVisible();
		// Should auto-select our rubric if it's the only/first one, or we select it
		// await page.selectOption('#rubric-select', ...);

		// 5. Fill Criteria
		// "Calidad de Código" (Max 10) -> Give 8
		await page.fill('input[max="10"]', "8");
		// "Documentación" (Max 5) -> Give 5
		await page.fill('input[max="5"]', "5");

		// Check calculation:
		// Weighted Sum: (8/10)*2 + (5/5)*1 = 1.6 + 1 = 2.6
		// Total Weight: 2 + 1 = 3
		// Final: (2.6 / 3) * 100 = 86.66 -> 87
		await expect(page.getByText("87 / 100")).toBeVisible();

		// 6. Submit
		await page.fill("#eval-feedback", "Buen trabajo");
		await page.getByRole("button", { name: "Guardar Evaluación" }).click();

		// 7. Verify Success (Task moves or shows "Evaluada" badge)
		await expect(
			page
				.locator(`text=${taskData.title}`)
				.locator("..")
				.getByText("Evaluada"),
		).toBeVisible();
	});
});
