#!/usr/bin/env node
'use strict';

// Builds the per-page optimization checklist (the Ahrefs-style page audit,
// generated from our own data instead of a subscription): for every page,
// the search it should win, every problem found on it, and the exact steps
// to optimize it. Output: data/page-recommendations.json, rendered in the
// console's Your Pages screen.
//
//   node scripts/build-recommendations.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (rel, fb) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch { return fb; } };

const pages = read('data/pages.json', { pages: [] }).pages;
const updates = read('data/page-updates.json', { pages: [], redirects: [] });
const findings = read('reports/seo-failures.json', { findings: [] }).findings;
const services = read('data/services.json', { core: [] }).core;
const opps = read('data/opportunities.json', { opportunities: [] }).opportunities;

const PLAIN = {
  'title-too-short': 'Rewrite the page title so it says the service and the city',
  'title-too-long': 'Shorten the page title so Google does not cut it off',
  'title-no-geo': 'Add the city to the page title',
  'title-duplicate': 'Give this page its own unique title',
  'description-duplicate': 'Write a unique description for this page',
  'description-missing': 'Write the description that shows under the Google listing',
  'meta-keywords-present': 'Remove the outdated keywords tag',
  'h1-missing': 'Add one clear main headline',
  'h1-multiple': 'Keep exactly one main headline',
  'content-critically-thin': 'Expand the page copy: scope, materials, decisions, timeline, investment band',
  'content-thin': 'Add enough copy for Google to understand the page',
  'http-404': 'Redirect this dead address to a live page',
  'template-bleed': 'Replace the pasted metadata from the wrong page',
};

const recs = [];
for (const p of pages) {
  if (p.statusCode !== 200 && p.statusCode !== 404) continue;
  const slugPath = p.path;
  const actions = [];

  // 1. The search this page should win
  let target = null;
  const opp = opps.find((o) => o.targetUrl && o.targetUrl.split(/[ ,+]/).includes(slugPath));
  const svcAsProof = services.find((s) => (s.proofAssets || []).includes(slugPath.replace('/', '')));
  const svcAsSpoke = services.find((s) => (s.blogSupport || []).includes(slugPath));
  if (opp) target = opp.query;
  else if (svcAsProof) target = `${svcAsProof.intent[0]} Granite Bay (as proof for ${svcAsProof.plannedUrl})`;
  else if (svcAsSpoke) target = `supports ${svcAsSpoke.plannedUrl} for "${svcAsSpoke.intent[0]}"`;
  else if (slugPath === '/') target = 'luxury home remodeling Granite Bay and Rocklin';

  // 2. Problems the site check found on this exact page
  const mine = findings.filter((f) => f.url.split('\n').map((u) => u.trim()).includes(p.url));
  for (const f of mine) {
    const step = PLAIN[f.check];
    if (step && !actions.some((a) => a.step === step)) {
      actions.push({ step, severity: f.severity === 'FAIL' ? 'costs rankings' : 'worth fixing' });
    }
  }

  // 3. The staged rewrite, if one is ready
  const staged = updates.pages.find((u) => u.path === slugPath);
  if (staged) actions.push({ step: `Publish the rewritten title: "${staged.title}"`, severity: 'ready to publish' });

  // 4. Structure: where this page should send its strength
  if (svcAsSpoke) actions.push({ step: `Link this post up to ${svcAsSpoke.plannedUrl} once that page is live`, severity: 'structure' });
  if (svcAsProof) {
    actions.push({ step: `Feature this project on ${svcAsProof.plannedUrl} with a client review`, severity: 'structure' });
    actions.push({ step: 'Name the project manager and link to the team page', severity: 'structure' });
  }

  // 5. Content depth targets
  const isProject = Boolean(svcAsProof);
  const targetWords = isProject ? 600 : 300;
  if (p.wordCount > 0 && p.wordCount < targetWords && !['/contact', '/careers', '/privacy'].includes(slugPath)) {
    actions.push({ step: `Grow the copy from ${p.wordCount} to ${targetWords}+ words with verifiable specifics`, severity: 'content' });
  }

  if (!actions.length) continue;
  recs.push({
    path: slugPath,
    targetQuery: target,
    steps: actions,
    score: actions.filter((a) => a.severity === 'costs rankings').length * 10 + actions.length,
  });
}

recs.sort((a, b) => b.score - a.score);
const out = { note: 'Per-page optimization checklists generated from crawl + site check + staged fixes + site plan. Rebuild with npm run recs:build after any of those change.', generatedAt: new Date().toISOString(), pages: recs };
fs.writeFileSync(path.join(ROOT, 'data', 'page-recommendations.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote optimization checklists for ${recs.length} pages -> data/page-recommendations.json`);
