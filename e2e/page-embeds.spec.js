const { test, expect } = require('@playwright/test');

for (const width of [1280, 390]) {
  test(`keeps the landing teaser lightweight and opens the native case workspace at ${width}px`, async ({ page }) => {
    const errors = [], scripts = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (request.resourceType() === 'script') scripts.push(request.url()); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./teaser-qa.html');
    await expect(page.getByRole('heading', { name: 'Plan the intervention. Prepare the procedure.' })).toBeVisible();
    await expect(page.locator('.endoplanner-teaser-feature')).toHaveCount(6);
    await expect(page.locator('.endoplanner-root')).toHaveCount(0);
    // Vite may inject its development client; the teaser has no app bundle.
    expect(scripts.filter((url) => /main\.jsx|build\/index|\/src\//.test(url))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('link', { name: 'Start case' }).click();
    await expect(page).toHaveURL(/workspace-qa\.html$/);
    await expect(page.getByRole('heading', { name: 'Clinical indication', exact: true })).toBeVisible();
    await expect(page.locator('.endoplanner-workspace .endo-wizard')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Back to EndoPlanner' })).toBeVisible();
    const appWidth = await page.locator('.endo-wizard').evaluate((node) => node.getBoundingClientRect().width);
    if (width > 1000) expect(appWidth).toBeGreaterThan(1000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
  });
}
