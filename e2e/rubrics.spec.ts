import { expect, test } from "@playwright/test";
import { loginViaApi } from "./utils/api-auth";

test.describe("Evaluations & Rubrics", () => {
	test("Should allow evaluation with a Rubric", async ({ page, request }) => {
		// 1. Login
		const { userEmail } = await loginViaApi(page, request, "admin", "ADMIN");

		// Login in request context for API calls
		await request.post("http://localhost:5000/api/auth/login", {
			data: { email: userEmail, password: "password123" },
		});

		// 2. Create Project via UI
		const timestamp = Date.now();
		const projectName = `Rubric Project ${timestamp}`;
		await page.goto("/projects");
		await page.getByRole("button", { name: "Nuevo Proyecto" }).click();
		await page.fill('input[name="name"]', projectName);
		await page.fill('textarea[name="description"]', "Desc");
		await page.getByRole("button", { name: "Crear", exact: true }).click();

		await page
			.locator(".bg-white")
			.filter({ hasText: projectName })
			.first()
			.getByRole("button", { name: "Ver" })
			.click();

		await page.waitForURL(/\/projects\/[a-zA-Z0-9]+/);
		const projectId = page.url().split("/projects/")[1];

		// 3. Create Rubric via API
		const rubricRes = await request.post("http://localhost:5000/api/rubrics", {
			data: {
				projectId: projectId,
				name: `Rubrica Test ${timestamp}`,
				description: "Rúbrica de prueba e2e",
				criteria: [
					{ name: "Calidad de Código", maxScore: 10, weight: 2 },
					{ name: "Documentación", maxScore: 5, weight: 1 },
				],
			},
		});
		expect(rubricRes.ok()).toBeTruthy();

		// 4. Create Task via API (COMPLETED)
		const taskTitle = `Tarea Evaluable ${timestamp}`;
		const taskRes = await request.post("http://localhost:5000/api/tasks", {
			data: {
				title: taskTitle,
				description: "Tarea para probar evaluación",
				projectId: projectId,
				status: "COMPLETED",
			},
		});
		expect(taskRes.ok()).toBeTruthy();

		// Note: If tasks need to be assigned to a student to be evaluable, we might need that.
		// But admins can maybe evaluate anyone.

		// 5. Go to Evaluations Page
		await page.goto("/evaluations");

		// 6. Select the Task
		// It might take a moment to appear
		await expect(page.getByText(taskTitle)).toBeVisible();

		// Click the "Evaluar" button for this specific task
		// Use a more specific selector to avoid matching the parent container
		await page
			.locator("div.rounded-lg.border") // Task card class
			.filter({ hasText: taskTitle })
			.getByRole("button", { name: "Evaluar" })
			.click();

		// 7. Verify Rubric Form appears
		// Wait for rubrics to load. It might take a moment for the fetch to complete.
		// The text "Seleccionar Rúbrica" appears only if rubrics exist.
		// We created one via API, but maybe the projectId mismatch or delay?
		// Let's try to wait a bit or check if the "No hay rúbricas" message appears, which would indicate a problem.

		// Check if "Evaluar Tarea" heading is visible (form opened)
		await expect(
			page.getByRole("heading", { name: "Evaluar Tarea" }),
		).toBeVisible();

		// Now check for Rubric selector or "No hay rúbricas"
		// If "No hay rúbricas", then our setup failed or ID mismatch.
		// await expect(page.getByText("No hay rúbricas")).not.toBeVisible();

		await expect(page.getByText("Seleccionar Rúbrica")).toBeVisible();

		// 8. Fill Criteria
		// Wait for rubric to be selected and criteria to appear
		await expect(page.getByText("Criterios")).toBeVisible();

		// Use getByRole for inputs associated with labels
		await page
			.getByRole("spinbutton", { name: /Calidad de Código/i })
			.fill("8");
		await page.getByRole("spinbutton", { name: /Documentación/i }).fill("5");

		// Check calculation
		// (8/10)*2 = 1.6. (5/5)*1 = 1. Total = 2.6. Max Weight = 3.
		// 2.6 / 3 = 0.8666... -> 87
		await expect(page.getByText("87 / 100")).toBeVisible();

		// 9. Submit
		await page.fill("#eval-feedback", "Buen trabajo");
		await page.getByRole("button", { name: "Guardar Evaluación" }).click();

		// 10. Verify Success
		// Check if the "Evaluada" badge appears in the task card
		await expect(
			page
				.locator("div.rounded-lg.border")
				.filter({ hasText: taskTitle })
				.getByText("Evaluada"),
		).toBeVisible();
	});
});
