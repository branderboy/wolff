#!/usr/bin/env node
'use strict';

// Duda API connection — the "updates at scale" layer.
//
// Duda has no SSH, no FTP, no git remote. This script is the bridge: git is
// the source of truth, and merges to main push approved changes through the
// Duda REST API. Diffs, review, rollback, and history live here — on a
// platform that natively offers none of that.
//
// Usage:
//   node scripts/push-duda.js                  # dry run: show what WOULD change
//   node scripts/push-duda.js --apply          # push page SEO updates
//   node scripts/push-duda.js --apply --schema # also inject head schema sitewide
//   node scripts/push-duda.js --publish        # republish the site after applying
//
// Credentials (never committed — set in the environment or GitHub secrets):
//   DUDA_API_USER, DUDA_API_PASS  — API credentials from the Duda account owner
//   DUDA_SITE_NAME                — the site's internal name in Duda
//   DUDA_API_BASE                 — default https://api.duda.co
//
// The blocker is political, not technical: API credentials live with whoever
// owns the Duda account (currently Bullsai). Establish access on day one.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const PUSH_SCHEMA = process.argv.includes('--schema');
const PUBLISH = process.argv.includes('--publish');

const BASE = process.env.DUDA_API_BASE || 'https://api.duda.co';
const SITE = process.env.DUDA_SITE_NAME;
const USER = process.env.DUDA_API_USER;
const PASS = process.env.DUDA_API_PASS;

const updates = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'page-updates.json'), 'utf8'));
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pages.json'), 'utf8')).pages;

function auth() {
  return 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');
}

async function duda(method, endpoint, body) {
  const res = await fetch(`${BASE}/api${endpoint}`, {
    method,
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${endpoint} -> ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

(async () => {
  // 1. Build the change set: proposed vs current (from last crawl import).
  const current = new Map(pages.map((p) => [p.path, p]));
  const changes = [];
  for (const u of updates.pages) {
    const cur = current.get(u.path) || {};
    const diff = {};
    if (u.title && u.title !== cur.title) diff.title = { from: cur.title || '(none)', to: u.title };
    if (u.metaDescription && u.metaDescription !== cur.metaDescription) {
      diff.description = { from: cur.metaDescription || '(none)', to: u.metaDescription };
    }
    if (Object.keys(diff).length) changes.push({ path: u.path, diff, note: u.note });
  }

  console.log(`${changes.length} page(s) with pending SEO changes:\n`);
  for (const c of changes) {
    console.log(`  ${c.path}${c.note ? `  [${c.note}]` : ''}`);
    for (const [field, d] of Object.entries(c.diff)) {
      console.log(`    ${field}: "${String(d.from).slice(0, 60)}"`);
      console.log(`         -> "${d.to}"`);
    }
  }

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to push through the Duda API.');
    return;
  }

  if (!SITE || !USER || !PASS) {
    console.error('\nMissing DUDA_SITE_NAME / DUDA_API_USER / DUDA_API_PASS. See .env.example.');
    process.exit(1);
  }

  // 2. Map site pages by path and push SEO updates.
  const sitePages = (await duda('GET', `/sites/multiscreen/${SITE}/pages/v2`)).results || [];
  const byPath = new Map(sitePages.map((p) => [`/${(p.path || '').replace(/^\//, '')}`, p]));

  for (const c of changes) {
    const target = byPath.get(c.path) || byPath.get(c.path === '/' ? '/home' : c.path);
    if (!target) {
      console.warn(`  SKIP ${c.path}: no matching page found in Duda site ${SITE}`);
      continue;
    }
    const seo = {};
    if (c.diff.title) seo.title = c.diff.title.to;
    if (c.diff.description) seo.description = c.diff.description.to;
    await duda('PUT', `/sites/multiscreen/${SITE}/pages/v2/${target.uuid}`, { seo });
    console.log(`  PUSHED ${c.path}`);
  }

  // 3. Optionally inject the entity schema into the site-wide <head>.
  if (PUSH_SCHEMA) {
    const distDir = path.join(ROOT, 'schema', 'dist');
    const org = fs.readFileSync(path.join(distDir, 'organization.jsonld'), 'utf8');
    const peopleFiles = fs.readdirSync(distDir).filter((f) => f.startsWith('person-'));
    const blocks = [org, ...peopleFiles.map((f) => fs.readFileSync(path.join(distDir, f), 'utf8'))]
      .map((j) => `<script type="application/ld+json">\n${j.trim()}\n</script>`)
      .join('\n');
    await duda('POST', `/sites/multiscreen/${SITE}/sitewidehtml`, { markup: blocks, location: 'HEAD' });
    console.log('  PUSHED site-wide entity schema (Organization + Person nodes)');
  }

  // 4. Republish so changes go live.
  if (PUBLISH) {
    await duda('POST', `/sites/multiscreen/publish/${SITE}`);
    console.log('  SITE REPUBLISHED');
  } else {
    console.log('\nApplied to the draft. Re-run with --publish (or publish in Duda) to go live.');
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
