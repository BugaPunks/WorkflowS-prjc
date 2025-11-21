import type { APIRequestContext, Page } from "@playwright/test";

export async function loginViaApi(
	page: Page,
	request: APIRequestContext,
	emailPrefix = "test",
	role: "ADMIN" | "STUDENT" = "ADMIN",
) {
	const uniqueId = Date.now().toString();
	const userEmail = `${emailPrefix}${uniqueId}@workflow.com`;
	const password = "password123";

	// Register
	const registerRes = await request.post(
		"http://localhost:5000/api/auth/register",
		{
			data: {
				name: "Test User",
				email: userEmail,
				password,
				role,
			},
		},
	);

	let userId = "";
	let userName = "Test User";

	if (!registerRes.ok()) {
		// Try login if user exists (though with uniqueId it shouldn't unless we reuse prefix often/quickly)
		// Or if we want to use a fixed user, we should handle that differently.
		// Here we assume unique users for isolation.
		const loginRes = await request.post(
			"http://localhost:5000/api/auth/login",
			{
				data: { email: userEmail, password },
			},
		);
		if (loginRes.ok()) {
			const loginData = await loginRes.json();
			userId = loginData.user.id;
			userName = loginData.user.name;
		} else {
			// Fallback or error
			console.error("Failed to register or login via API");
		}
	} else {
		const body = await registerRes.json();
		userId = body.user.id;
		userName = body.user.name;
	}

	// Bypass UI Login
	await page.goto("/");
	await page.evaluate(
		({ id, name, email, role }) => {
			localStorage.setItem("user", JSON.stringify({ id, name, email, role }));
		},
		{ id: userId, name: userName, email: userEmail, role },
	);

	await page.reload();
	return { userId, userName, userEmail };
}
