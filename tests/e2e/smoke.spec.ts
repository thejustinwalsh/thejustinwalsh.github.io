import { test, expect } from "@playwright/test";

test.describe("smoke tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/tjw\.dev/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("devlog index loads", async ({ page }) => {
    await page.goto("/devlog");
    await expect(page).toHaveTitle(/Devlog/);
  });

  test("projects index loads", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveTitle(/Projects/);
  });

  test("404 page renders", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("h1")).toContainText("Nothing here.");
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/devlog"]');
    await expect(page).toHaveURL(/\/devlog/);
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
  });

  test("search opens and shows results", async ({ page }) => {
    await page.goto("/");

    // Wait for the search button to exist, then click to open
    // Use click instead of keyboard shortcut — Meta+K conflicts with Chrome address bar
    const searchBtn = page.locator('button[aria-label*="Search"]');
    await expect(searchBtn).toBeVisible({ timeout: 10000 });
    // Wait for Astro client:idle hydration to attach React event handlers
    await page.waitForFunction(
      (sel) => {
        const btn = document.querySelector(sel);
        // Headless UI attaches data attributes after hydration
        return btn !== null && btn.closest('[data-astro-cid]') !== null || btn?.getAttribute('type') === 'button';
      },
      'button[aria-label*="Search"]',
      { timeout: 10000 },
    );
    await page.waitForTimeout(1000);

    await searchBtn.click();

    // Wait for the search input to appear inside the dialog panel
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a search query
    await searchInput.fill("astro");

    // Wait for results to appear
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible({ timeout: 10000 });
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible({ timeout: 5000 });

    // Arrow down to select first result
    await page.keyboard.press("ArrowDown");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");

    // Press Enter to navigate
    const href = await options.first().locator("a").getAttribute("href");
    await page.keyboard.press("Enter");
    if (href) {
      await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  test("search dialog closes with ESC", async ({ page }) => {
    await page.goto("/");

    const searchBtn = page.locator('button[aria-label*="Search"]');
    await expect(searchBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await searchBtn.click();

    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // ESC closes it
    await page.keyboard.press("Escape");
    await expect(searchInput).not.toBeVisible({ timeout: 5000 });
  });
});
