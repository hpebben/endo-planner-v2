const { test, expect } = require('@playwright/test');

for (const width of [1280, 390]) {
  test(`keeps the landing teaser lightweight and opens the native case workspace at ${width}px`, async ({ page }) => {
    const errors = [], scripts = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (request.resourceType() === 'script') scripts.push(request.url()); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./teaser-qa.html');
    await expect(page.getByRole('heading', { name: 'Plan the intervention. Prepare the procedure.' })).toBeVisible();
    await expect(page.locator('.endoplanner-teaser-feature')).toHaveCount(4);
    await expect(page.locator('.endoplanner-showcase-slide')).toHaveCount(4);
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    expect(await page.getByRole('tabpanel').locator('img').evaluate((node) => node.complete && node.naturalWidth === 1280)).toBe(true);
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

async function openWithClock(page) {
  await page.clock.install({ time: new Date('2026-10-18T10:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-18T10:00:01Z'));
  await page.goto('./teaser-qa.html');
  await expect(page.locator('.endoplanner-teaser')).toHaveAttribute('data-showcase-ready', 'true');
}

test('rotates real stage screenshots every five seconds and wraps to the first stage', async ({ page }) => {
  await openWithClock(page);
  const tabs = page.getByRole('tab');
  await page.clock.runFor(4999);
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  for (const stage of [1, 2, 3, 0]) {
    await page.clock.runFor(stage === 1 ? 1 : 5000);
    await expect(tabs.nth(stage)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(stage)).toHaveCSS('background-color', 'rgb(17, 49, 149)');
    await expect(page.getByRole('tabpanel')).toHaveAttribute('data-slide', String(stage));
    await expect(page.locator(`[data-dot="${stage}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.getByRole('tabpanel').locator('img').evaluate((node) => node.complete && node.naturalWidth === 1280)).toBe(true);
  }
});

test('supports stage-number hover, dots, keyboard navigation and pause/play', async ({ page }) => {
  await openWithClock(page);
  const tabs = page.getByRole('tab');
  await tabs.nth(2).locator('.endoplanner-feature-number').hover();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('data-slide', '2');
  await page.clock.runFor(10000);
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Show Case summary', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('data-slide', '3');
  await tabs.nth(3).focus();
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('data-slide', '1');
  await page.clock.runFor(10000);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Pause slideshow', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.clock.runFor(10000);
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Play slideshow', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.clock.runFor(5000);
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
});

test('respects reduced motion while keeping manual stage selection available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWithClock(page);
  await expect(page.getByRole('button', { name: 'Play slideshow', exact: true })).toBeVisible();
  await page.clock.runFor(20000);
  await expect(page.getByRole('tabpanel')).toHaveAttribute('data-slide', '0');
  await page.getByRole('tab', { name: /Disease anatomy/ }).click();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('data-slide', '1');
});
