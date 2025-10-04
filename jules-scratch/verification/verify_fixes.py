from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Go to login page
        page.goto("http://localhost:3001/login", timeout=60000)
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/01_login_page.png")

        # 2. Go to a protected route without logging in to see redirect/unauth message
        page.goto("http://localhost:3001/dashboard/admin", timeout=60000)
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/02_admin_dashboard_unauthed.png")

        # 3. Go to another protected route
        page.goto("http://localhost:3001/dashboard/dosen", timeout=60000)
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/03_dosen_dashboard_unauthed.png")

        # 4. Go to the main public page
        page.goto("http://localhost:3001/", timeout=60000)
        page.wait_for_load_state("networkidle")
        page.screenshot(path="jules-scratch/verification/04_main_page.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)