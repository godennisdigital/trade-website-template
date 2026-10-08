const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const configuredUrl = new URL(config.siteUrl);

if (configuredUrl.protocol !== 'https:' || configuredUrl.username || configuredUrl.password || configuredUrl.search || configuredUrl.hash) {
  throw new Error('siteUrl must be an HTTPS URL without credentials, query parameters, or a fragment.');
}

const baseUrl = `${configuredUrl.origin}${configuredUrl.pathname.replace(/\/+$/, '')}`;
const siteRootPath = `${configuredUrl.pathname.replace(/\/+$/, '')}/`;
const htmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);
const xmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
})[character]);

const updateMetadata = (filename, title, description) => {
  const filepath = path.join(root, filename);
  let html = fs.readFileSync(filepath, 'utf8');
  const titlePattern = /<title data-config="metaTitle">[\s\S]*?<\/title>/;
  const descriptionPattern = /<meta name="description" content="[^"]*" data-config="metaDescription">/;

  if (!titlePattern.test(html) || !descriptionPattern.test(html)) {
    throw new Error(`Expected config-driven title and description hooks in ${filename}.`);
  }

  html = html.replace(titlePattern, `<title data-config="metaTitle">${htmlEscape(title)}</title>`);
  html = html.replace(
    descriptionPattern,
    `<meta name="description" content="${htmlEscape(description)}" data-config="metaDescription">`,
  );
  fs.writeFileSync(filepath, html);
};

const addSiteBase = (filename) => {
  const filepath = path.join(root, filename);
  let html = fs.readFileSync(filepath, 'utf8');
  if (!html.includes('<head>')) throw new Error(`Expected a head element in ${filename}.`);
  const baseTag = `<base href="${htmlEscape(siteRootPath)}">`;
  if (/<base href="[^"]*">/.test(html)) {
    html = html.replace(/<base href="[^"]*">/, baseTag);
  } else {
    html = html.replace('<head>', `<head>\n        ${baseTag}`);
  }
  fs.writeFileSync(filepath, html);
};

updateMetadata('index.html', config.seo.title, config.seo.description);
updateMetadata('privacy.html', config.privacy.title, config.privacy.description);
updateMetadata('404.html', config.seo.notFoundTitle, config.seo.notFoundDescription);
addSiteBase('privacy.html');
addSiteBase('404.html');

const sitemapUrls = [`${baseUrl}/`, `${baseUrl}/privacy.html`];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

const colors = config.theme.colors;
const initial = xmlEscape(config.business.brandInitial || config.business.brandName.slice(0, 1));
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="${xmlEscape(colors.lime)}"/><text x="50" y="73" text-anchor="middle" font-family="Georgia,serif" font-size="70" fill="${xmlEscape(colors['green-deep'])}">${initial}</text></svg>\n`;
fs.writeFileSync(path.join(root, 'favicon.svg'), favicon);