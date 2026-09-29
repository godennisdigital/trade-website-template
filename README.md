# Trades Website Template

A mobile-first, no-build static website starter for independent trades and home-service businesses. The included page is a visual demo for Apex Plumbing & Heating; replace its sample business details and claims before using this template for a client.

## Start a client project

Create each client site as a new repository using GitHub's **Use this template** workflow. This gives the client repo its own history and keeps future client changes independent. Do not make client sites as branches of this template repo.

For a local preview, run this from the project root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. No package install, build step, framework, or deployment server is required; any static host can serve the files.

## Project layout

```text
.
├── index.html                    # Page content, metadata, and LocalBusiness schema
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

- Update the page title, description, business name, phone links, email, address, service list, coverage areas, reviews, and footer in `index.html`.
- Update the LocalBusiness JSON-LD in the document head to match the real company. Remove any fields or claims that cannot be verified.
- Change the colors and type styles in the custom properties at the top of `css/style.css`.
- Replace the demo photo URLs in `index.html` with client-owned or properly licensed images. Add optimized local assets under `images/` and use descriptive alt text.
- Update the map query and replace the generic social links with the client's real profiles, or remove them.
- Complete [the client launch checklist](docs/client-launch-checklist.md) before publishing.

## Form behavior

The quote form validates required fields and a 10–15 digit phone number in the browser. It does not send or store enquiries: a successful submission only logs the values to the browser console and shows a demo message. Connect a form provider or client endpoint, then test delivery, privacy wording, and error states before launch.

## External services

The demo loads fonts and photos from Google Fonts and Unsplash, and embeds a Google Maps iframe. These require an internet connection and are not bundled locally. Confirm the chosen assets and services are appropriate for each client and their privacy requirements.
