import type { APIRequestContext, Page } from "@playwright/test";

export async function loginViaApi(
	page: Page,
	request?: APIRequestContext, // Make request optional or require it. Actually tests should pass it.
	emailPrefix = "test",
	role: "ADMIN" | "STUDENT" = "ADMIN",
) {
	// If request is not provided, we need to create a context or fail.
	// However, usually 'request' fixture is available in test.
	// But our helper signature was: (page, request, ...).
	// In the test files I wrote: `await loginViaApi(page);` missing the request argument!

	// Strategy:
	// 1. If request is provided, use it.
	// 2. If not, try to use page.request (which wraps APIRequestContext associated with the page's context)
	const apiRequest = request || page.request;

	const uniqueId = Date.now().toString() + Math.floor(Math.random() * 1000); // More unique
	const userEmail = `${emailPrefix}${uniqueId}@workflow.com`;
	const password = "password123";

	// Register
	const registerRes = await apiRequest.post(
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
		console.log(
			"Register failed status:",
			registerRes.status(),
			await registerRes.text(),
		);
		// Try login if user exists
		const loginRes = await apiRequest.post(
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
			throw new Error("Failed to register or login via API");
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
