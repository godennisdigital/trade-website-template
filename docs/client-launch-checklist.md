# Client Launch Checklist

<div style="font-size: 1.1em; line-height: 1.7;">

## Business details

- [ ] Replace every Apex name, phone number, email, address, and service-area reference.
- [ ] Use the same business name and contact details in the header, footer, metadata, and structured data.
- [ ] Verify opening hours, qualifications, insurance, years of experience, guarantees, and pricing claims with the client.
- [ ] Replace all sample testimonials with genuine, approved reviews; remove the rating summary if it cannot be substantiated.
- [ ] Replace generic social destinations with the client's profiles or remove those links.

## Content and assets

- [ ] Tailor the page title, meta description, headline, services, and coverage areas to the real business.
- [ ] Set the canonical HTTPS site URL in `site.config.json`, then run `npm run generate:site` and verify `robots.txt`, `sitemap.xml`, favicon, and all page metadata.
- [ ] Review `privacy.html` and replace each review instruction with details that match the client's real data practices and providers.
- [ ] Check the quote-form privacy notice and custom 404 page on the deployed domain.
- [ ] Replace the map location and check that the embedded map points to the correct service area.
- [ ] Replace demo photos with client-owned or properly licensed images; optimize them and keep useful alt text.
- [ ] Confirm the phone links use a valid international number, for example `tel:+442079460958`.
- [ ] Check spelling, accessibility, and mobile layouts at narrow, tablet, and desktop widths.

## Enquiries and publishing

- [ ] Connect the quote form to an agreed inbox or form provider. The current form is demo-only and does not send enquiries.
- [ ] Test required fields, invalid phone numbers, successful delivery, and error handling.
- [ ] Add appropriate privacy information and confirm how submitted data is handled.
- [ ] Verify the live domain, HTTPS, page metadata, and LocalBusiness structured data.
- [ ] Create the site in a separate repository and verify the client repo contains no internal business planning files.

</div>
