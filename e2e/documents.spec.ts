import { expect, test } from "@playwright/test";
import { loginViaApi } from "./utils/api-auth";

test.describe("Document Management & Versioning", () => {
	test.skip("Should upload file and handle versioning", async ({
		page,
		request,
	}) => {
		// 1. Login
		await loginViaApi(page, request, "admin", "ADMIN");

		// 2. Navigate to a project
		// Create project first to be safe
		await page.goto("/projects");
		const timestamp = Date.now();
		await page.getByRole("button", { name: "Nuevo Proyecto" }).click();
		await page.fill('input[name="name"]', `Project Docs ${timestamp}`);
		await page.fill('textarea[name="description"]', "Desc");
		await page.getByRole("button", { name: "Crear", exact: true }).click();

		// Navigate to Details
		await page
			.locator(".bg-white")
			.filter({ hasText: `Project Docs ${timestamp}` })
			.first()
			.getByRole("button", { name: "Ver" })
			.click();

		// 3. Switch to Documents tab
		await page.getByRole("button", { name: "Documentos" }).click();

		// 4. Upload a file (Mocked via prompt interception)
		const fileName = `Doc_Test_${timestamp}.pdf`;

		page.on("console", (msg) => console.log(`PAGE LOG: ${msg.text()}`));

		// Setup dialog handler BEFORE action
		page.on("dialog", async (dialog) => {
			console.log(
				`Dialog type: ${dialog.type()}, message: ${dialog.message()}`,
			);
			if (dialog.type() === "prompt") {
				await dialog.accept(fileName);
			} else {
				await dialog.accept();
			}
		});

		// Click Upload
		const uploadPromise = page.waitForResponse(
			(resp) => resp.url().includes("/api/documents") && resp.status() === 201,
		);
		await page.getByRole("button", { name: "Subir Archivo" }).click();
		await uploadPromise;

		// Wait for upload list update
		// Use a loop or wait for API GET response of list
		const listPromise = page.waitForResponse(
			(resp) => resp.url().includes("/api/documents") && resp.status() === 200,
		);
		// Trigger reload of list manually if needed, or just wait if auto-reload happens (it doesn't, except via handleUpload calling loadDocs)
		// handleUpload calls loadDocs on success. So listPromise should fire.
		await listPromise;

		await expect(page.getByText(fileName)).toBeVisible({ timeout: 10000 });

		// 5. Upload SAME file name again to trigger versioning
		// Reset dialog handler or rely on existing one?
		// The existing one logic "accept(fileName)" works for prompt, "accept()" works for confirm?
		// But dialog.accept(string) is only for prompt.
		// Let's refine the handler above.

		await page.getByRole("button", { name: "Subir Archivo" }).click();

		// 6. Verify Version Badge
		// Assuming the UI updates to V2 automatically
		await expect(page.getByText("V2")).toBeVisible();

		// 7. Open History
		await page.getByRole("button", { name: "Historial" }).click();
		await expect(page.getByText("Historial de Versiones")).toBeVisible();
		await expect(page.getByText("Versión 1")).toBeVisible();
		await expect(page.getByText("Versión 2")).toBeVisible();
	});
});
