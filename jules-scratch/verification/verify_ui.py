import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_frontend(page: Page):
    """
    This script verifies the key pages of the application.
    """
    # 1. Verify Homepage
    page.goto("http://localhost:3001")
    expect(page.get_by_role("heading", name="Your Ultimate Solution for Managing Thesis Projects")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/homepage.png")

    # 2. Verify Login Page
    page.goto("http://localhost:3001/login")
    expect(page.get_by_role("heading", name="Welcome Back")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/login-page.png")

    # 3. Verify Announcements Page
    page.goto("http://localhost:3001/pengumuman")
    expect(page.get_by_role("heading", name="Pengumuman")).to_be_visible()
    # Wait for the content to load
    expect(page.get_by_text("Loading announcements...")).to_be_hidden()
    page.screenshot(path="jules-scratch/verification/announcements-page.png")

    # 4. Verify Tawaran Topik Page (logged out)
    page.goto("http://localhost:3001/tawaran-topik")
    expect(page.get_by_role("heading", name="Tawaran Topik")).to_be_visible()
    expect(page.get_by_text("You must be logged in to view this page.")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/tawaran-topik-page-logged-out.png")

    # 5. Verify Jadwal Sidang Page (logged out)
    page.goto("http://localhost:3001/jadwal-sidang")
    expect(page.get_by_role("heading", name="Jadwal Sidang")).to_be_visible()
    expect(page.get_by_text("You must be logged in to view this page.")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/jadwal-sidang-page-logged-out.png")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_frontend(page)
    browser.close()