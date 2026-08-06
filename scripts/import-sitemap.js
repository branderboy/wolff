#!/usr/bin/env node
'use strict';

// Pulls the live sitemap and reconciles it against data/pages.json.
// Usage: node scripts/import-sitemap.js [sitemapUrl]
//
// Pages in the sitemap but not in the crawl are appended as
// "in sitemap, not crawled" rows so every count in the app reflects the
// whole site, not just the last crawl export. Run a fresh Screaming Frog
// crawl (npm run crawl:import) to fill in their titles and word counts.

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SITEMAP = process.argv[2] || 'https://www.wolffconstruction.com/sitemap.xml';
const pagesPath = path.join(__dirname, '..', 'data', 'pages.json');

function fetch(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'wolff-search-ops/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetch(new URL(res.headers.location, url).href, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode} for ${url}`)); }
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].trim());

(async () => {
  let xml;
  try {
    xml = await fetch(SITEMAP);
  } catch (e) {
    console.error(`Could not reach ${SITEMAP}: ${e.message}`);
    console.error('Run this from a machine with normal internet access; some sandboxes block the site.');
    process.exit(1);
  }

  let urls = locs(xml);
  // Sitemap index: every loc is itself a sitemap
  if (/<sitemapindex/i.test(xml)) {
    const children = urls;
    urls = [];
    for (const child of children) {
      try { urls.push(...locs(await fetch(child))); }
      catch (e) { console.error(`skipped ${child}: ${e.message}`); }
    }
  }
  urls = [...new Set(urls.filter((u) => !/\.(jpg|jpeg|png|webp|gif|pdf)(\?|$)/i.test(u)))];

  const data = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
  const known = new Set(data.pages.map((p) => { try { return new URL(p.url).pathname.replace(/\/$/, '') || '/'; } catch { return p.path; } }));
  const missing = urls.filter((u) => { const p = new URL(u).pathname.replace(/\/$/, '') || '/'; return !known.has(p); });

  for (const u of missing) {
    data.pages.push({
      url: u,
      path: new URL(u).pathname,
      statusCode: 0,
      indexability: 'in sitemap, not crawled',
      title: '', titleLength: 0, metaDescription: '', metaDescriptionLength: 0,
      metaKeywords: '', h1: '', h1Second: '', canonical: '', wordCount: 0,
      crawlDepth: 0, inlinks: 0,
    });
  }
  const inSitemap = new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, '') || '/'));
  const notInSitemap = data.pages.filter((p) => p.statusCode === 200 && !inSitemap.has((p.path || '').replace(/\/$/, '') || '/')).map((p) => p.path);

  data.sitemap = { url: SITEMAP, urlCount: urls.length, checkedAt: new Date().toISOString().slice(0, 10), addedFromSitemap: missing.length };
  fs.writeFileSync(pagesPath, JSON.stringify(data, null, 2) + '\n');

  console.log(`Sitemap lists ${urls.length} pages. Crawl had ${known.size}.`);
  console.log(missing.length ? `Added ${missing.length} pages the crawl missed:\n  ${missing.join('\n  ')}` : 'The crawl already covered every sitemap URL.');
  if (notInSitemap.length) console.log(`Crawled pages NOT in the sitemap (check they should be indexed):\n  ${notInSitemap.join('\n  ')}`);
  console.log('Now re run the full crawl to fill in titles and word counts, then npm run seo:validate.');
})();
