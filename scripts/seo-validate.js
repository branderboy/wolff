#!/usr/bin/env node
'use strict';

// SEO regression gate for wolffconstruction.com.
//
// Modes:
//   node scripts/seo-validate.js                 -> validate data/pages.json (from crawl import)
//   node scripts/seo-validate.js --live          -> crawl the live site and validate responses
//   node scripts/seo-validate.js --report out.md -> also write a markdown failure report
//
// Exit code 1 on any FAIL so CI blocks the merge. WARN does not block.
//
// The reason this file exists: /blog shipped with the careers page title
// ("Join Wolff Construction Team") and was indexed that way. No human caught
// it. This gate catches that class of error before merge, every time.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const cities = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const reviewsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'reviews.json'), 'utf8'));

const GEO_TOKENS = cities.geoTokens;
const TITLE_MAX = 65;
const TITLE_MIN = 25;
const DESC_MAX = 160;
const DESC_MIN = 70;
const THIN_WORDS = 300;
const CRITICAL_THIN_WORDS = 90;

// Pages that legitimately need no geo token or marketing depth.
const GEO_EXEMPT = ['/privacy', '/careers', '/blog'];
const THIN_EXEMPT = ['/privacy', '/contact', '/careers'];

// Luxury mush that reads as brochure copy and retrieves as nothing.
const BANNED_BUZZWORDS = [
  'living masterpiece', 'every moment, elevated', 'sanctuaries',
  'unparalleled', 'seamless experience', 'elevate your lifestyle',
];

const args = process.argv.slice(2);
const LIVE = args.includes('--live');
const reportIdx = args.indexOf('--report');
const reportPath = reportIdx > -1 ? args[reportIdx + 1] : null;

const findings = [];
function add(severity, check, url, detail) {
  findings.push({ severity, check, url, detail });
}

// ---------------------------------------------------------------------------
// Page-level checks that work in both CSV and live mode
// ---------------------------------------------------------------------------
function checkPages(pages) {
  const byTitle = new Map();
  const byDesc = new Map();

  for (const p of pages) {
    if (p.statusCode === 404) {
      add('FAIL', 'http-404', p.url, `Returns 404 with ${p.inlinks || 'unknown'} internal inlinks. Fix the link or redirect the URL.`);
      continue;
    }
    if (p.statusCode >= 300 && p.statusCode < 400) {
      add('WARN', 'internal-redirect', p.url, `Internally linked URL redirects (${p.statusCode}). Link to the final URL.`);
      continue;
    }
    if (p.statusCode !== 200) continue;

    // Titles
    if (!p.title) {
      add('FAIL', 'title-missing', p.url, 'Page has no title tag.');
    } else {
      const t = p.title.trim();
      (byTitle.get(t) || byTitle.set(t, []).get(t)).push(p.url);
      if (t.length > TITLE_MAX) add('FAIL', 'title-too-long', p.url, `Title is ${t.length} chars (max ${TITLE_MAX}): "${t}"`);
      if (t.length < TITLE_MIN) add('FAIL', 'title-too-short', p.url, `Title is ${t.length} chars (min ${TITLE_MIN}): "${t}". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.`);
      if (!GEO_EXEMPT.includes(p.path) && !GEO_TOKENS.some((g) => t.includes(g))) {
        add('FAIL', 'title-no-geo', p.url, `Title carries no geo token (${GEO_TOKENS.slice(0, 4).join(', ')}, ...): "${t}"`);
      }
    }

    // Meta descriptions
    if (!p.metaDescription) {
      add('FAIL', 'description-missing', p.url, 'Page has no meta description.');
    } else {
      const d = p.metaDescription.trim();
      (byDesc.get(d) || byDesc.set(d, []).get(d)).push(p.url);
      if (d.length > DESC_MAX) add('WARN', 'description-too-long', p.url, `Description is ${d.length} chars (max ${DESC_MAX}).`);
      if (d.length < DESC_MIN) add('WARN', 'description-too-short', p.url, `Description is ${d.length} chars (min ${DESC_MIN}).`);
    }

    // Dead-since-2009 tell
    if (p.metaKeywords) {
      add('WARN', 'meta-keywords-present', p.url, `Meta keywords tag present ("${p.metaKeywords}"). Dead since 2009. Remove it.`);
    }

    // H1 discipline
    if (!p.h1) add('FAIL', 'h1-missing', p.url, 'Page has no H1.');
    if (p.h1 && p.h1Second) add('FAIL', 'h1-multiple', p.url, `More than one H1: "${p.h1}" / "${p.h1Second}"`);

    // Canonicals
    if (p.canonical && p.canonical !== p.url) {
      add('WARN', 'canonical-mismatch', p.url, `Canonical points elsewhere: ${p.canonical}`);
    }

    // Thin content
    if (!THIN_EXEMPT.includes(p.path) && p.wordCount > 0) {
      if (p.wordCount < CRITICAL_THIN_WORDS) {
        add('FAIL', 'content-critically-thin', p.url, `${p.wordCount} words. A project page under ${CRITICAL_THIN_WORDS} words cannot rank or be cited for anything.`);
      } else if (p.wordCount < THIN_WORDS) {
        add('WARN', 'content-thin', p.url, `${p.wordCount} words (target ${THIN_WORDS}+ for indexable marketing pages).`);
      }
    }
  }

  // Duplicates
  for (const [title, urls] of byTitle) {
    if (urls.length > 1) {
      add('FAIL', 'title-duplicate', urls.join('\n  '), `${urls.length} pages share the title "${title}".`);
    }
  }
  for (const [desc, urls] of byDesc) {
    if (urls.length > 1) {
      add('FAIL', 'description-duplicate', urls.join('\n  '), `${urls.length} pages share the same meta description ("${desc.slice(0, 70)}...").`);
    }
  }

  // Cross-page template-bleed check: careers metadata on a non-careers page.
  for (const p of pages) {
    if (p.path !== '/careers' && /join .*team|career/i.test(p.title || '')) {
      add('FAIL', 'template-bleed', p.url, `Non-careers page carries careers metadata: "${p.title}". This is the live /blog bug.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Live-only checks (need real HTML)
// ---------------------------------------------------------------------------
async function fetchPage(url) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'wolff-seo-validate/1.0' } });
  const html = res.status === 200 ? await res.text() : '';
  return { url, status: res.status, html };
}

function meta(html, name, attr = 'name') {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, 'i');
  const m = html.match(re);
  if (!m) return null;
  const c = m[0].match(/content=["']([^"']*)["']/i);
  return c ? c[1] : '';
}

function checkLiveHtml(page) {
  const { url, html } = page;
  if (!html) return;

  const og = meta(html, 'og:image', 'property');
  if (!og) add('FAIL', 'og-image-missing', url, 'No og:image. Every share renders blank.');
  else if (/favicon|\.ico/i.test(og)) add('FAIL', 'og-image-favicon', url, `og:image is the favicon (${og}). Shares of a visual luxury brand render a tiny logo instead of a kitchen.`);

  const tw = meta(html, 'twitter:card');
  if (tw && tw !== 'summary_large_image') add('FAIL', 'twitter-card-small', url, `twitter:card is "${tw}", should be summary_large_image.`);

  const ld = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  if (ld.length === 0) {
    add('FAIL', 'jsonld-missing', url, 'No JSON-LD structured data on the page.');
  } else {
    for (const m of ld) {
      try {
        const parsed = JSON.parse(m[1]);
        const blocks = Array.isArray(parsed) ? parsed : [parsed];
        for (const b of blocks) {
          const types = [].concat(b['@type'] || []);
          if (types.includes('Review') || types.includes('AggregateRating')) {
            const verified = (reviewsData.reviews || []).filter((r) => r.body);
            if (verified.length === 0) {
              add('FAIL', 'review-schema-unsourced', url, 'Review/AggregateRating markup found with no verified matching row in data/reviews.json. Every rating claim must be sourced.');
            }
          }
        }
      } catch {
        add('FAIL', 'jsonld-invalid', url, 'JSON-LD block does not parse.');
      }
    }
  }

  const imgs = [...html.matchAll(/<img[^>]*>/gi)];
  const noAlt = imgs.filter((m) => !/alt=["'][^"']+["']/i.test(m[0]));
  if (noAlt.length) add('WARN', 'img-missing-alt', url, `${noAlt.length} <img> tags without alt text.`);

  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  for (const word of BANNED_BUZZWORDS) {
    if (body.toLowerCase().includes(word.toLowerCase())) {
      add('WARN', 'banned-buzzword', url, `Body copy contains "${word}". Brochure language retrieves as nothing — replace with a verifiable specific.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
(async () => {
  let pages;
  if (LIVE) {
    const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pages.json'), 'utf8')).pages;
    console.log(`Live mode: fetching ${seed.length} URLs...`);
    pages = [];
    for (const s of seed) {
      try {
        const live = await fetchPage(s.url);
        const html = live.html;
        const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
        const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
        pages.push({
          url: s.url,
          path: s.path,
          statusCode: live.status,
          title,
          metaDescription: meta(html, 'description') || '',
          metaKeywords: meta(html, 'keywords') || '',
          h1: h1s[0] || '',
          h1Second: h1s[1] || '',
          canonical: (html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || '',
          wordCount: html ? html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : 0,
          inlinks: s.inlinks,
        });
        checkLiveHtml({ url: s.url, html });
      } catch (e) {
        add('WARN', 'fetch-failed', s.url, e.message);
      }
    }
  } else {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pages.json'), 'utf8'));
    pages = data.pages;
    console.log(`CSV mode: validating ${pages.length} pages imported from ${data.source}`);
  }

  checkPages(pages);

  const fails = findings.filter((f) => f.severity === 'FAIL');
  const warns = findings.filter((f) => f.severity === 'WARN');

  for (const f of findings) {
    console.log(`\n[${f.severity}] ${f.check}\n  ${f.url}\n  ${f.detail}`);
  }
  console.log(`\n${'='.repeat(60)}\n${fails.length} FAIL, ${warns.length} WARN across ${pages.length} pages`);

  if (reportPath) {
    const lines = [
      '# SEO Validation Report — wolffconstruction.com',
      '',
      `Mode: ${LIVE ? 'live crawl' : 'crawl CSV'} | Pages: ${pages.length} | **${fails.length} failures**, ${warns.length} warnings`,
      '',
      'This is the output of the CI gate (`npm run seo:validate`) run against the current site.',
      'Every failure below shipped to production and was indexed. The gate blocks merges that reintroduce any of them.',
      '',
    ];
    for (const sev of ['FAIL', 'WARN']) {
      const group = findings.filter((f) => f.severity === sev);
      if (!group.length) continue;
      lines.push(`## ${sev === 'FAIL' ? 'Failures (block the build)' : 'Warnings'}`, '');
      const byCheck = {};
      for (const f of group) (byCheck[f.check] ||= []).push(f);
      for (const [check, items] of Object.entries(byCheck)) {
        lines.push(`### \`${check}\` — ${items.length}`, '');
        for (const f of items) lines.push(`- ${f.url.split('\n')[0]}`, `  - ${f.detail.replace(/\n\s*/g, ' ')}`);
        lines.push('');
      }
    }
    fs.writeFileSync(reportPath, lines.join('\n') + '\n');
    console.log(`Report written to ${reportPath}`);
  }

  process.exit(fails.length ? 1 : 0);
})();
