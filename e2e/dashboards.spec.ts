import { expect, test } from "@playwright/test";
import { loginViaApi } from "./utils/api-auth";

test.describe("Dashboard Roles Split", () => {
	test("Admin should see Evaluations in sidebar", async ({ page, request }) => {
		// Login as Admin
		await loginViaApi(page, request, "admin", "ADMIN");
		await expect(page).toHaveURL(/\/projects|\/login-success|\//);

		// Go to a main page to see sidebar
		await page.goto("/projects");

		// Check sidebar items
		await expect(
			page.getByRole("link", { name: "Evaluaciones" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "Reportes" })).toBeVisible();
	});

	test("Student SHOULD see Evaluations in sidebar", async ({
		page,
		request,
	}) => {
		// Login as Student
		await loginViaApi(page, request, "student", "TEAM_DEVELOPER");

		await page.goto("/projects");

		// Check sidebar items
		await expect(page.getByRole("link", { name: "Proyectos" })).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Evaluaciones" }),
		).toBeVisible();

		// Verify access
		await page.goto("/evaluations");
		await expect(page.getByRole("heading", { name: "Mis Calificaciones" })).toBeVisible();
	});
});
