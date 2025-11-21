from playwright.sync_api import sync_playwright
import time

def verify_redesign():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        # 1. Register/Login (API Bypass)
        api_context = p.request.new_context()
        user_email = f"visual_admin_{int(time.time())}@test.com"
        res = api_context.post("http://localhost:5000/api/auth/register", data={
            "name": "Visual Admin",
            "email": user_email,
            "password": "password123",
            "role": "ADMIN"
        })

        if res.ok:
            user_data = res.json()
            user_id = user_data["user"]["id"]
            user_name = user_data["user"]["name"]
        else:
            login_res = api_context.post("http://localhost:5000/api/auth/login", data={
                "email": user_email, "password": "password123"
            })
            login_data = login_res.json()
            user_id = login_data["user"]["id"]
            user_name = login_data["user"]["name"]

        # Set localStorage
        page.goto("http://localhost:3000/")
        page.evaluate(f"""
            localStorage.setItem('user', JSON.stringify({{
                id: '{user_id}',
                name: '{user_name}',
                email: '{user_email}',
                role: 'ADMIN'
            }}));
        """)
        page.reload()

        # 2. Go to Projects (Dashboard)
        page.goto("http://localhost:3000/projects")
        page.wait_for_load_state("networkidle")

        # 3. Create a Project (to see card style)
        # Check if we need to create it (might persist if reusing DB, but unique email likely means new user)
        # Just in case, we can create one.
        page.get_by_role("button", name="Nuevo Proyecto").click()
        page.fill('input[name="name"]', "Visual Redesign Project")
        page.fill('textarea[name="description"]', "This project is created to verify the visual redesign of cards and layout.")
        page.get_by_role("button", name="Crear Proyecto").click()

        # Wait for card to appear
        page.wait_for_selector("text=Visual Redesign Project")

        # Screenshot Dashboard with Sidebar
        page.screenshot(path="/home/jules/verification/dashboard_redesign.png", full_page=True)
        print("Screenshot taken: dashboard_redesign.png")

        # 4. Mobile View Sidebar Check
        mobile_context = browser.new_context(viewport={"width": 375, "height": 667})
        mobile_page = mobile_context.new_page()
        # Set local storage for mobile too
        mobile_page.goto("http://localhost:3000/")
        mobile_page.evaluate(f"""
            localStorage.setItem('user', JSON.stringify({{
                id: '{user_id}',
                name: '{user_name}',
                email: '{user_email}',
                role: 'ADMIN'
            }}));
        """)
        mobile_page.reload()
        mobile_page.goto("http://localhost:3000/projects")

        # Open Sidebar
        mobile_page.get_by_label("Abrir menú").click()
        mobile_page.wait_for_timeout(500) # Animation

        mobile_page.screenshot(path="/home/jules/verification/mobile_sidebar.png")
        print("Screenshot taken: mobile_sidebar.png")

        browser.close()

if __name__ == "__main__":
    verify_redesign()
