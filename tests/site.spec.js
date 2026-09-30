const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const siteConfig = require('./site.config.json');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads the page, metadata, and configured sections', async ({ page }) => {
  await expect(page).toHaveTitle(/\S/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  for (const sectionId of siteConfig.requiredSectionIds) {
    await expect(page.locator(`#${sectionId}`)).toHaveCount(1);
  }

  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  expect(imagesWithoutAlt).toBe(0);
});

test('runs without uncaught JavaScript errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.reload();

  expect(pageErrors).toEqual([]);
});

test('keeps in-page links and service cards connected to real content', async ({ page }) => {
  const brokenAnchorLinks = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links
      .filter((link) => !document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1))))
      .map((link) => link.getAttribute('href')),
  );
  expect(brokenAnchorLinks).toEqual([]);

  const serviceCards = page.locator('.service-item');
  expect(await serviceCards.count()).toBeGreaterThanOrEqual(siteConfig.minimumServiceCards);

  for (const card of await serviceCards.all()) {
    await expect(card.locator('h3')).toHaveText(/\S/);
    await expect(card.locator('p')).toHaveText(/\S/);
    await expect(card.locator('a')).toHaveAttribute('href', '#quote-form');
  }
});

test('provides working desktop and mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator('.site-nav')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const menuButton = page.locator('.menu-toggle');
  const navigation = page.locator('.site-nav');

  await expect(menuButton).toBeVisible();
  await expect(navigation).toBeHidden();
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();

  await menuButton.click();
  await navigation.locator('a[href="#available-services"]').click();
  await expect(page).toHaveURL(/#available-services$/);
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
});

test('validates required quote fields and rejects an invalid phone number', async ({ page }) => {
  const form = page.locator(siteConfig.formSelector);
  const nameField = page.locator(siteConfig.requiredFormFieldSelectors[0]);
  const phoneField = page.locator(siteConfig.phoneFieldSelector);

  for (const fieldSelector of siteConfig.requiredFormFieldSelectors) {
    await expect(page.locator(fieldSelector)).toHaveAttribute('required', '');
  }

  await form.locator('button[type="submit"]').click();
  expect(await nameField.evaluate((field) => field.checkValidity())).toBe(false);

  await page.locator(siteConfig.requiredFormFieldSelectors[0]).fill('Alex Morgan');
  await phoneField.fill('123456789');
  await page.locator(siteConfig.requiredFormFieldSelectors[2]).selectOption({ index: 1 });
  await page.locator(siteConfig.requiredFormFieldSelectors[3]).fill('A test enquiry.');
  await form.locator('button[type="submit"]').click();

  expect(await phoneField.evaluate((field) => field.checkValidity())).toBe(false);
  await expect(page.locator(siteConfig.formStatusSelector)).toBeEmpty();
});

test('shows feedback and resets the quote form after valid submission', async ({ page }) => {
  const form = page.locator(siteConfig.formSelector);
  const status = page.locator(siteConfig.formStatusSelector);

  await page.locator(siteConfig.requiredFormFieldSelectors[0]).fill('Alex Morgan');
  await page.locator(siteConfig.phoneFieldSelector).fill('+447700900123');
  await page.locator(siteConfig.requiredFormFieldSelectors[2]).selectOption({ index: 1 });
  await page.locator(siteConfig.requiredFormFieldSelectors[3]).fill('A test enquiry.');
  await form.locator('button[type="submit"]').click();

  await expect(status).toHaveText(/\S/);
  await expect(page.locator(siteConfig.requiredFormFieldSelectors[0])).toHaveValue('');
  await expect(page.locator(siteConfig.phoneFieldSelector)).toHaveValue('');
});

test('keeps contact links consistent with structured business data', async ({ page }) => {
  const telephoneLinks = await page.locator('a[href^="tel:"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href').slice(4).replace(/\D/g, '')).filter(Boolean),
  );
  const emailLinks = await page.locator('a[href^="mailto:"]').count();
  expect(telephoneLinks.length).toBeGreaterThan(0);
  expect(emailLinks).toBeGreaterThan(0);

  const structuredDataScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const entities = structuredDataScripts
    .map((script) => JSON.parse(script))
    .flatMap((data) => (Array.isArray(data) ? data : data['@graph'] || [data]));
  const business = entities.find((entity) => entity.name && entity.telephone);

  expect(business).toBeTruthy();
  expect(telephoneLinks).toContain(String(business.telephone).replace(/\D/g, ''));
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const significantViolations = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact),
  );

  expect(significantViolations).toEqual([]);
});

test('does not overflow horizontally at common viewport widths', async ({ page }) => {
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test('updates the footer copyright year to the current year', async ({ page }) => {
  await expect(page.locator('#current-year')).toHaveText(String(new Date().getFullYear()));
});