import { expect, test } from "@playwright/test";
import { loginAs } from "./utils/auth";

test.describe("Dashboard Roles Split", () => {
	test("Admin should see Evaluations in sidebar", async ({ page }) => {
		// Login as Admin
		await loginAs(page, "admin@workflow.com", "admin123");
		await expect(page).toHaveURL(/\/projects|\/login-success/);

		// Go to a main page to see sidebar
		await page.goto("/projects");

		// Check sidebar items
		await expect(
			page.getByRole("link", { name: "Evaluaciones" }),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "Reportes" })).toBeVisible();
	});

	test("Student should NOT see Evaluations in sidebar", async ({ page }) => {
		// We need a student user. Assuming one exists or we should create/register one.
		// For now, let's try to register one quickly if possible or rely on seed?
		// The seed only created Admin. We should register a new user.

		await page.goto("/register");
		await page.fill('input[name="name"]', "Estudiante Test");
		await page.fill('input[name="email"]', "student@test.com");
		await page.fill('input[name="password"]', "student123");
		// Role default is TEAM_DEVELOPER in backend? No, frontend register might not send role or backend defaults.
		// Let's check RegisterForm.
		await page.getByRole("button", { name: "Registrarse" }).click();

		// Expect success or redirect
		await expect(page).toHaveURL(/\/login/); // Or login-success depending on flow

		// Login
		await loginAs(page, "student@test.com", "student123");
		await page.goto("/projects");

		// Check sidebar items
		await expect(page.getByRole("link", { name: "Proyectos" })).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Evaluaciones" }),
		).not.toBeVisible();

		// Verify protection
		await page.goto("/evaluations");
		await expect(page.getByText("Acceso Restringido")).toBeVisible();
	});
});
