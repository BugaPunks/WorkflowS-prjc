import { expect, test } from "@playwright/test";
import { loginAs } from "./utils/auth";

test.describe("Document Management & Versioning", () => {
	test("Should upload file and handle versioning", async ({
		page,
		request,
	}) => {
		// 1. Login
		await loginAs(page, "admin@workflow.com", "admin123");

		// 2. Navigate to a project (assumed seeded project)
		await page.goto("/projects");
		await page.getByRole("link", { name: "Ver detalles" }).first().click();

		// 3. Switch to Documents tab
		await page.getByRole("button", { name: "Documentos" }).click();

		// 4. Upload a file (Mocked via prompt interception in real app, but here we simulate the API call or use the UI prompt)
		// Since we use window.prompt, we need to handle the dialog

		const fileName = `Doc_Test_${Date.now()}.pdf`;

		page.on("dialog", async (dialog) => {
			if (dialog.message().includes("Nombre del archivo")) {
				await dialog.accept(fileName);
			} else if (dialog.message().includes("ya existe")) {
				await dialog.accept(); // Confirm new version
			} else {
				await dialog.accept();
			}
		});

		// Click Upload
		await page.getByRole("button", { name: "Subir Archivo" }).click();

		// Wait for upload
		await expect(page.getByText(fileName)).toBeVisible();

		// 5. Upload SAME file name again to trigger versioning
		await page.getByRole("button", { name: "Subir Archivo" }).click();

		// 6. Verify Version Badge
		await expect(page.getByText("V2")).toBeVisible();

		// 7. Open History
		await page.getByRole("button", { name: "Historial" }).click();
		await expect(page.getByText("Historial de Versiones")).toBeVisible();
		await expect(page.getByText("Versión 1")).toBeVisible();
		await expect(page.getByText("Versión 2")).toBeVisible();
	});
});
