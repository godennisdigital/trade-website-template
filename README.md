# Trades Website Template

A mobile-first, no-build static website starter for independent trades and home-service businesses. The included page is a visual demo for Apex Plumbing & Heating; replace its sample business details and claims before using this template for a client.

## Start a client project

Create each client site as a new repository using GitHub's **Use this template** workflow. This gives the client repo its own history and keeps future client changes independent. Do not make client sites as branches of this template repo.

For a local preview, run this from the project root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. The site remains static and needs no runtime server or framework. Before publishing a client site, run `npm run generate:site` to create the crawler files, favicon, and static metadata from `site.config.json`.

## Automated tests

The reusable Playwright suite checks page structure, in-page links, service cards, desktop and mobile navigation, quote-form validation and feedback, contact details against structured data, privacy/404 pages, generated SEO files, serious accessibility issues, responsive layouts, and the footer year. `npm test` regenerates SEO assets before testing. GitHub Actions runs the suite for pushes and pull requests.

Install Node.js 22 or later, then install the dependencies and Chromium once:

```sh
npm install
npx playwright install chromium
```

Run the suite with `npm test`. To see the browser while tests run, use `npm run test:headed`; after a run, open its HTML report with `npm run test:report`. The test runner starts the existing static site automatically. Set `PLAYWRIGHT_BASE_URL` only when testing a separately hosted copy.

When adapting this template, edit `tests/site.config.json` if sections, service-card markup, or form selectors change. The tests intentionally infer client-specific phone details from the page and its structured data rather than hard-coding Apex's contact information.

## Project layout

```text
.
├── index.html                    # Homepage content and config-driven metadata/schema
├── privacy.html                  # Adaptable privacy policy template
├── 404.html                      # Static-host not-found page
├── robots.txt                    # Generated from site.config.json
├── sitemap.xml                   # Generated from site.config.json
├── favicon.svg                   # Generated from brand initial and theme colors
├── css/
│   └── style.css                 # Responsive styles and theme variables
├── js/
│   └── script.js                 # Mobile navigation and quote-form validation
├── images/
│   └── README.md                 # Guidance for client-owned image assets
├── docs/
│   └── client-launch-checklist.md
└── README.md
```

`docs/business_model.txt` and `profile-pic.jpg` are local workspace files and are excluded from new Git tracking. If either file was already tracked, `.gitignore` alone will not remove it; untrack it and verify repository history before sharing the template or creating client repos. Keep internal business planning out of client repos.

## Customize

- Update the canonical `siteUrl`, page titles/descriptions, business name, phone links, email, address, service list, coverage areas, reviews, privacy wording, and footer in `site.config.json`.
- Run `npm run generate:site` after changing the config and before publishing. It creates `robots.txt`, `sitemap.xml`, and `favicon.svg`, and writes config-driven static title/description tags into all pages for crawlers that do not execute JavaScript.
- Confirm the generated sitemap URLs use the client's live HTTPS domain.
- Change the colors and type styles in the custom properties at the top of `css/style.css`.
- Replace the demo photo URLs in `site.config.json` with client-owned or properly licensed images. Add optimized local assets under `images/` and use descriptive alt text.
- Update the map query and replace the generic social links with the client's real profiles, or remove them.
- Complete [the client launch checklist](docs/client-launch-checklist.md) before publishing.

## Form behavior

The quote form validates required fields and a 10–15 digit phone number in the browser, then posts submissions to the Formspree endpoint configured in `site.config.json`. Successful submissions show confirmation and clear the form; failed requests retain the entered details and show an error. Verify the endpoint delivers to the intended inbox and that the privacy policy accurately describes the provider and its handling of submitted data before launch.

## Privacy template

`privacy.html` and the quote-form notice provide a starting point, not legal advice. Before publishing, verify the controller and contact details, lawful bases, form provider, international transfers, retention period, security statements, third-party resources, and rights information against the client's actual practices. Replace every review instruction in the config with accurate policy text.

## External services

The demo loads fonts and photos from Google Fonts and Unsplash, and embeds a Google Maps iframe. These require an internet connection and are not bundled locally. Confirm the chosen assets and services are appropriate for each client and their privacy requirements.
