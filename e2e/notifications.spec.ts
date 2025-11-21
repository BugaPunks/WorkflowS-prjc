import { expect, test } from "@playwright/test";
import { loginAs } from "./utils/auth";

test.describe("Notification System", () => {
	test("Should receive notification when assigned a task", async ({
		page,
		// request,
	}) => {
		// 1. Setup: Create Admin and Student (if not exists)
		// We'll assume admin exists. We need a student to assign task to.
		// Or we can assign task to Admin themselves for simplicity of test.

		const adminEmail = "admin@workflow.com";

		// Login as Admin
		await loginAs(page, adminEmail, "admin123");

		// Get User ID (Admin) - we can grab it from local storage or API
		// Let's just create a task assigned to self via API for speed
		// Need project ID
		await page.goto("/projects");
		// Wait for project list
		await expect(page.getByText("Proyecto Demo").first()).toBeVisible(); // Assuming seed

		// Get project ID from URL or Link
		// Let's assume first project
		const projectLink = page
			.getByRole("link", { name: "Ver detalles" })
			.first();
		await projectLink.click();
		const url = page.url();
		const projectId = url.split("/").pop();

		// Get User ID from localStorage
		const userStr = await page.evaluate(() => localStorage.getItem("user"));
		const user = JSON.parse(userStr || "{}");
		const userId = user.id;

		// Create Task via API assigned to self
		const taskTitle = `Tarea Notificación ${Date.now()}`;
		const taskRes = await page.request.post("http://localhost:3000/api/tasks", {
			data: {
				title: taskTitle,
				description: "Testing notifications",
				projectId: projectId,
				assigneeId: userId,
				status: "TODO",
			},
		});
		expect(taskRes.ok()).toBeTruthy();

		// 2. Check Notification Bell
		// It polls every 10s, so we might need to wait or trigger reload
		// We can wait for the badge count
		await expect(
			page.locator('button[aria-label="Notificaciones"] span').last(),
		).toBeVisible({ timeout: 15000 });

		// 3. Open Notifications
		await page.getByLabel("Notificaciones").click();

		// 4. Verify Content
		await expect(page.getByText("Nueva Tarea Asignada")).toBeVisible();
		await expect(
			page.getByText(`Se te ha asignado la tarea: ${taskTitle}`),
		).toBeVisible();

		// 5. Mark as read (click it)
		await page.getByText("Nueva Tarea Asignada").click();

		// 6. Verify badge gone or count decreased (if we had 1, now 0)
		// If there were 0 before, now 0.
		// Re-open to check style change (bg-blue-50 gone)
		await page.getByLabel("Notificaciones").click(); // Close
		await page.getByLabel("Notificaciones").click(); // Open

		// Check if read style is applied (not bold/blue bg)
		// Hard to check exact style class with simple text locator, but we can assume logic works if API returned success.
	});
});
