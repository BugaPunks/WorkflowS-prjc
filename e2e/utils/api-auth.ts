import type { APIRequestContext, Page } from "@playwright/test";

export async function loginViaApi(
	request: APIRequestContext,
	email: string,
	password = "password123",
	name = "Test User",
	role: "ADMIN" | "TEAM_DEVELOPER" | "PRODUCT_OWNER" | "SCRUM_MASTER" = "TEAM_DEVELOPER",
) {
	// Register
	const registerRes = await request.post("/api/auth/register", {
		data: { name, email, password, role },
	});

	let userId = "";

	if (!registerRes.ok()) {
		// Maybe exists, try login
		const loginRes = await request.post("/api/auth/login", {
			data: { email, password },
		});
		if (loginRes.ok()) {
			const data = await loginRes.json();
			userId = data.user.id;
		} else {
			throw new Error(`Auth failed for ${email}`);
		}
	} else {
		const data = await registerRes.json();
		userId = data.user.id;
	}

	return { id: userId, email, name, role };
}
