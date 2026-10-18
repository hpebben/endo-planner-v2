const { test, expect } = require('@playwright/test');

for (const width of [1920, 1280, 390, 320]) {
  test(`keeps the landing teaser lightweight and opens the native case workspace at ${width}px`, async ({ page }) => {
    const errors = [], scripts = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (request.resourceType() === 'script') scripts.push(request.url()); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./teaser-qa.html');
    await expect(page.getByRole('heading', { name: 'If you fail to plan, you plan to fail' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Endoplanner At a Glance', exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Endoplanner', exact: true })).toBeVisible();
    expect(await page.locator('.endoplanner-teaser-logo').evaluate((node) => node.complete && node.naturalWidth === 512)).toBe(true);
    const teaser = await page.locator('.endoplanner-teaser').boundingBox();
    const logo = await page.locator('.endoplanner-teaser-logo').boundingBox();
    const title = await page.locator('.endoplanner-teaser-intro h2').boundingBox();
    expect(teaser.x).toBe(0);
    expect(teaser.width).toBe(width);
    expect(logo.y).toBeGreaterThanOrEqual(0);
    expect(logo.y).toBeLessThan(teaser.y);
    expect(logo.y + logo.height).toBeGreaterThan(teaser.y);
    expect(logo.x).toBeGreaterThan(width / 2);
    expect(logo.x + logo.width).toBeLessThanOrEqual(width);
    expect(title.y >= logo.y + logo.height || title.x + title.width <= logo.x).toBe(true);
    for (const selector of ['.jupiterx-header .container', '.jupiterx-footer .container']) {
      await expect(page.locator(selector)).toHaveCSS('max-width', '1067px');
      await expect(page.locator(selector)).toHaveCSS('padding-left', '20px');
    }
    await expect(page.getByText('Local device preferences · Automatic browser save', { exact: true })).toHaveCount(0);
    await expect(page.locator('.endoplanner-teaser-feature')).toHaveCount(4);
    await expect(page.locator('.endoplanner-showcase-slide')).toHaveCount(4);
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel').getByText('Woundosome selection', { exact: true })).toBeVisible();
    const layout = await page.evaluate(() => {
      const box = (node) => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, bottom: r.bottom }; };
      return {
        heading: box(document.querySelector('.endoplanner-showcase-heading')),
        tabs: [...document.querySelectorAll('[data-stage]')].map(box),
        dots: box(document.querySelector('.endoplanner-showcase-controls')),
        caption: box(document.querySelector('[data-slide="0"] figcaption')),
        image: box(document.querySelector('[data-slide="0"] img')),
      };
    });
    expect(layout.tabs.every((tab) => tab.y === layout.tabs[0].y)).toBe(true);
    expect(layout.tabs.every((tab, index) => index === 0 || tab.x > layout.tabs[index - 1].x)).toBe(true);
    expect(layout.tabs[0].y).toBeGreaterThanOrEqual(layout.heading.bottom);
    expect(layout.dots.y).toBeGreaterThanOrEqual(layout.tabs[0].bottom);
    expect(layout.caption.y).toBeGreaterThanOrEqual(layout.dots.bottom);
    expect(layout.image.y).toBeGreaterThanOrEqual(layout.caption.bottom);
    await expect(page.locator('.endoplanner-showcase-slide:not([hidden]) figcaption')).toHaveCSS('text-align', 'center');
    await expect(page.locator('.endoplanner-teaser-intro h2')).toHaveCSS('font-family', /kobenhavn-cs/);
    expect(await page.getByRole('tabpanel').locator('img').evaluate((node) => node.complete && node.naturalWidth === 1280)).toBe(true);
    await expect(page.locator('.endoplanner-root')).toHaveCount(0);
    // Vite may inject its development client; the teaser has no app bundle.
    expect(scripts.filter((url) => /main\.jsx|build\/index|\/src\//.test(url))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('link', { name: 'Start case' }).click();
    await expect(page).toHaveURL(/workspace-qa\.html$/);
    await expect(page.getByRole('heading', { name: 'Clinical indication', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Clinical indication', exact: true })).toHaveCSS('font-family', /kobenhavn-cs/);
    await expect(page.getByRole('heading', { name: 'Fontaine stage', exact: true })).toHaveCSS('font-family', /kobenhavn-cs/);
    await expect(page.locator('.endoplanner-workspace .endo-wizard')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Back to EndoPlanner' })).toBeVisible();
    const workspace = await page.locator('.endoplanner-workspace').boundingBox();
    expect(workspace.x).toBe(0);
    expect(workspace.width).toBe(width);
    await expect(page.locator('body')).toHaveCSS('margin', '0px');
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
    await expect(tabs.nth(stage)).toHaveCSS('background-color', 'rgb(16, 44, 104)');
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
