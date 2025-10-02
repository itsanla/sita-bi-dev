from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the login page
        page.goto("http://localhost:3001/login")

        # Log in as admin
        page.get_by_label("Email or Username").fill("admin@test.com")
        page.get_by_label("Password").fill("admin")
        page.get_by_role("button", name="Sign In").click()

        # Wait for a stable element on the redirected page
        expect(page.get_by_role("heading", name="Tawaran Topik")).to_be_visible()

        # Now, navigate to the links page
        page.goto("http://localhost:3001/dashboard/admin/links")

        # Take a screenshot of the links table with the "View" button
        page.screenshot(path="jules-scratch/verification/links_table.png")

        # Click the "View" link for the first link in the table
        view_links = page.get_by_role("link", name="View")
        expect(view_links.first).to_be_visible()
        view_links.first.click()

        # Wait for navigation to the link details page
        page.wait_for_url("**/dashboard/admin/links/**")

        # Take a screenshot of the link details page
        page.screenshot(path="jules-scratch/verification/link_details.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)