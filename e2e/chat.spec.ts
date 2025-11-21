import { expect, test } from "@playwright/test";
import { loginViaApi } from "./utils/api-auth";

test.describe("Chat System", () => {
	test("Should allow sending and receiving messages", async ({
		page,
		request,
	}) => {
		const { userId } = await loginViaApi(page, request, "chat_user", "ADMIN");

		// Create Project
		const timestamp = Date.now();
		const projectRes = await request.post(
			"http://localhost:5000/api/projects",
			{
				data: {
					name: `Chat Project ${timestamp}`,
					description: "Chat Test",
					ownerId: userId,
				},
			},
		);
		const projectData = await projectRes.json();
		const projectId = projectData.data.id;

		// Go to Chat
		await page.goto(`/projects/${projectId}`);
		await page.getByRole("button", { name: "Chat" }).click();

		// Send Message
		const message = `Hello World ${timestamp}`;
		await page.fill('input[placeholder="Escribe un mensaje..."]', message);
		await page.getByRole("button", { name: "Enviar" }).click();

		// Verify Message Appears
		await expect(page.getByText(message)).toBeVisible();

		// Reload to verify persistence
		await page.reload();
		await page.getByRole("button", { name: "Chat" }).click();
		await expect(page.getByText(message)).toBeVisible();
	});
});
