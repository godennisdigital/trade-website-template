const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const siteConfig = require('./site.config.json');
const clientConfig = require('../site.config.json');

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

test('selects a smaller hero image source on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 823 });
  const heroImage = page.locator('.hero-visual > img');

  await expect(heroImage).toHaveAttribute('srcset', /480w/);
  const imageDetails = await heroImage.evaluate((image) => ({
    selectedWidth: Number(new URL(image.currentSrc).searchParams.get('w')),
    renderedWidth: image.getBoundingClientRect().width,
    devicePixelRatio: window.devicePixelRatio,
  }));

  expect(imageDetails.selectedWidth).toBeLessThan(1400);
  expect(imageDetails.selectedWidth).toBeGreaterThanOrEqual(imageDetails.renderedWidth * imageDetails.devicePixelRatio);
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

test('sends valid quote requests to Formspree and resets after success', async ({ page }) => {
  const form = page.locator(siteConfig.formSelector);
  const status = page.locator(siteConfig.formStatusSelector);
  const endpoint = await form.getAttribute('action');
  await expect(form).toHaveAttribute('method', 'POST');

  await page.route(endpoint, async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().accept).toBe('application/json');
    expect(route.request().postData()).toContain('Alex Morgan');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.locator(siteConfig.requiredFormFieldSelectors[0]).fill('Alex Morgan');
  await page.locator(siteConfig.phoneFieldSelector).fill('+447700900123');
  await page.locator(siteConfig.requiredFormFieldSelectors[2]).selectOption({ index: 1 });
  await page.locator(siteConfig.requiredFormFieldSelectors[3]).fill('A test enquiry.');
  await form.locator('button[type="submit"]').click();

  await expect(status).toContainText(/request has been sent/i);
  await expect(page.locator(siteConfig.requiredFormFieldSelectors[0])).toHaveValue('');
  await expect(page.locator(siteConfig.phoneFieldSelector)).toHaveValue('');
});

test('keeps quote details and reports an error when Formspree rejects a request', async ({ page }) => {
  const form = page.locator(siteConfig.formSelector);
  const status = page.locator(siteConfig.formStatusSelector);
  const endpoint = await form.getAttribute('action');

  await page.route(endpoint, (route) => route.fulfill({ status: 422, body: 'Submission rejected' }));
  await page.locator(siteConfig.requiredFormFieldSelectors[0]).fill('Alex Morgan');
  await page.locator(siteConfig.phoneFieldSelector).fill('+447700900123');
  await page.locator(siteConfig.requiredFormFieldSelectors[2]).selectOption({ index: 1 });
  await page.locator(siteConfig.requiredFormFieldSelectors[3]).fill('A test enquiry.');
  await form.locator('button[type="submit"]').click();

  await expect(status).toContainText(/couldn't send your request/i);
  await expect(page.locator(siteConfig.requiredFormFieldSelectors[0])).toHaveValue('Alex Morgan');
  await expect(page.locator(siteConfig.phoneFieldSelector)).toHaveValue('+447700900123');
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

test('renders footer content from site config', async ({ page }) => {
  const footer = page.locator('.footer-main');
  const contactColumn = footer.locator('.footer-column').nth(0);
  const informationColumn = footer.locator('.footer-column').nth(1);

  await expect(footer.locator('.footer-brand .brand-name > span')).toHaveText(clientConfig.business.brandName);
  await expect(footer.locator('.footer-brand .brand-name small')).toHaveText(clientConfig.business.brandTagline);
  expect(await footer.locator('[data-config="footerTagline"]').innerHTML()).toBe(clientConfig.footer.tagline);
  await expect(contactColumn.locator('[data-config="footerPhone"]')).toHaveText(clientConfig.business.phoneDisplay);
  await expect(contactColumn.locator('[data-config="footerPhone"]')).toHaveAttribute(
    'href',
    `tel:${clientConfig.business.phone}`,
  );
  await expect(contactColumn.locator('[data-config="footerEmail"]')).toHaveText(clientConfig.business.email);
  await expect(contactColumn.locator('[data-config="footerEmail"]')).toHaveAttribute(
    'href',
    `mailto:${clientConfig.business.email}`,
  );
  await expect(contactColumn.locator('[data-config="footerAddressLineOne"]')).toHaveText(clientConfig.footer.addressLineOne);
  await expect(contactColumn.locator('[data-config="footerAddressLineTwo"]')).toHaveText(clientConfig.footer.addressLineTwo);
  await expect(informationColumn.locator('[data-config="footerAvailabilityHeading"]')).toHaveText(clientConfig.footer.availableHeading);
  expect(await informationColumn.locator('[data-config="footerAvailability"]').innerHTML()).toBe(clientConfig.footer.availability);
  await expect(informationColumn.locator('[data-config="facebookLink"]')).toHaveAttribute('href', clientConfig.business.facebookUrl);
  await expect(informationColumn.locator('[data-config="instagramLink"]')).toHaveAttribute('href', clientConfig.business.instagramUrl);
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

test('keeps page content visible across device sizes and resolutions', async ({ page }) => {
  const viewports = [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 700, height: 900 },
    { width: 701, height: 900 },
    { width: 768, height: 1024 },
    { width: 900, height: 900 },
    { width: 901, height: 768 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];
  const sectionSelector = 'header, main > section, .site-footer';
  const contentSelector = [
    '.brand',
    '.site-nav',
    '.hero-copy',
    '.hero-visual',
    '.services-grid',
    '.about-copy',
    '.area-copy',
    '.map-frame',
    '.work-gallery',
    '.review-grid',
    '.quote-intro',
    '.quote-form',
    '.footer-main',
  ].join(', ');

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    const layout = await page.evaluate(({ sectionSelector, contentSelector }) => {
      const viewportWidth = document.documentElement.clientWidth;
      const sections = [...document.querySelectorAll(sectionSelector)].map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          name: element.id || element.className || element.tagName,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          right: rect.right,
        };
      });
      const contentOutsideViewport = [...document.querySelectorAll(contentSelector)]
        .filter((element) => getComputedStyle(element).display !== 'none')
        .map((element) => ({
          name: element.className || element.tagName,
          rect: element.getBoundingClientRect(),
        }))
        .filter(({ rect }) => rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1))
        .map(({ name }) => name);
      const overflowingText = [...document.querySelectorAll('h1, h2, h3, .hero-lede, .service-item p, .review blockquote, .footer-column a')]
        .filter((element) => element.getBoundingClientRect().width > 0 && element.scrollWidth > element.clientWidth + 1)
        .map((element) => element.textContent.trim());
      const brandMarks = [...document.querySelectorAll('.brand-mark')].map((element) => {
        const style = getComputedStyle(element);
        return {
          alignItems: style.alignItems,
          justifyItems: style.justifyItems,
          lineHeight: Number.parseFloat(style.lineHeight),
          height: element.clientHeight,
        };
      });

      return {
        viewportWidth,
        documentWidth: document.documentElement.scrollWidth,
        sections,
        contentOutsideViewport,
        overflowingText,
        brandMarks,
        menuToggleVisible: getComputedStyle(document.querySelector('.menu-toggle')).display !== 'none',
        navigationVisible: getComputedStyle(document.querySelector('.site-nav')).display !== 'none',
      };
    }, { sectionSelector, contentSelector });

    expect(layout.documentWidth, `horizontal page overflow at ${viewport.width}px`).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.sections.filter((section) => section.width <= 0 || section.height <= 0), `missing sections at ${viewport.width}px`).toEqual([]);
    expect(layout.contentOutsideViewport, `content outside viewport at ${viewport.width}px`).toEqual([]);
    expect(layout.overflowingText, `text overflow at ${viewport.width}px`).toEqual([]);
    expect(layout.brandMarks.length).toBeGreaterThan(0);
    for (const mark of layout.brandMarks) {
      expect(mark.alignItems, `brand initial vertical alignment at ${viewport.width}px`).toBe('center');
      expect(mark.justifyItems, `brand initial horizontal alignment at ${viewport.width}px`).toBe('center');
      expect(mark.lineHeight, `brand initial line box at ${viewport.width}px`).toBeLessThanOrEqual(mark.height);
    }
    expect(layout.menuToggleVisible, `mobile menu visibility at ${viewport.width}px`).toBe(viewport.width <= 700);
    expect(layout.navigationVisible, `navigation visibility at ${viewport.width}px`).toBe(viewport.width > 700);
  }
});

test('updates the footer copyright year to the current year', async ({ page }) => {
  await expect(page.locator('#current-year')).toHaveText(String(new Date().getFullYear()));
});