#!/usr/bin/env node
'use strict';

// Builds the GitHub Pages snapshot of the console into docs/.
// Pages can only serve files, so the app ships with its data baked into
// static-state.json; the frontend falls back to it automatically when the
// live API is not there. Read only: screens all work, action buttons
// explain they need the local app.
//
//   npm run pages:build

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'app', 'public');
const OUT = path.join(ROOT, 'docs');

const readJson = (rel, fb) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch { return fb; } };
const mtime = (rel) => { try { return fs.statSync(path.join(ROOT, rel)).mtime.toISOString().slice(0, 10); } catch { return null; } };

// Same shape as GET /api/state, minus live environment checks.
const perf = (f) => mtime(path.join('data', 'performance', f));
const state = {
  pages: readJson('data/pages.json', { pages: [] }),
  updates: readJson('data/page-updates.json', { pages: [], redirects: [] }),
  plan: readJson('data/plan.json', { phases: [] }),
  validation: readJson('reports/seo-failures.json'),
  company: (() => { const c = readJson('data/company.json', {}); return { displayName: c.displayName, license: c.license }; })(),
  competitors: readJson('data/competitors.json', { competitors: [] }),
  opportunities: readJson('data/opportunities.json', { opportunities: [] }),
  structure: readJson('data/site-structure.json', { tree: [], linkingRules: [] }),
  recommendations: readJson('data/page-recommendations.json', { pages: [] }),
  workers: (() => {
    const w = readJson('data/workers.json', { workers: [] });
    for (const x of w.workers) x.lastOrder = mtime(path.join('reports', 'workers', x.id, 'workorder.md'));
    return w;
  })(),
  dudaReady: false,
  connections: [
    { id: 'duda', name: 'Duda (your website)', feeds: 'Publishing fixes to the site', ready: false, lastData: null, setup: 'API keys from Bullsai; the day one ask' },
    { id: 'gsc', name: 'Google Search Console', feeds: 'Real searches you already appear for', ready: false, lastData: perf('gsc-queries.json'), setup: 'Free. CSV export works with zero setup: npm run connect:gsc' },
    { id: 'volumes', name: 'DataForSEO', feeds: 'Search volumes for every target query', ready: false, lastData: perf('volumes.json'), setup: 'Pay as you go, under $1 for this set: npm run connect:volumes' },
    { id: 'speed', name: 'PageSpeed Insights', feeds: 'Site speed scores per page', ready: true, lastData: perf('speed.json'), setup: 'Free, works now: npm run connect:speed' },
    { id: 'semantic', name: 'Embeddings (Voyage or OpenAI)', feeds: 'Which page best matches each search; gaps and overlap', ready: false, lastData: perf('semantic-map.json'), setup: 'Either key works, Voyage free tier or your OpenAI key: npm run connect:semantic' },
    { id: 'citations', name: 'Citation checker', feeds: 'Your profiles across the web say Rocklin and match your NAP', ready: true, lastData: perf('sameas-audit.json'), setup: 'No key needed: npm run connect:citations' },
    { id: 'trends', name: 'Google Trends', feeds: 'When Californians research each service; the months to publish into', ready: true, lastData: perf('seasonality.json'), setup: 'No key needed: npm run connect:trends' },
    { id: 'indexnow', name: 'IndexNow', feeds: 'Instant indexing of published fixes on Bing, which feeds ChatGPT search and Copilot', ready: true, lastData: perf('indexnow-log.json'), setup: 'One key file hosted at the site root, then: npm run connect:indexnow' },
  ],
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'static-state.json'), JSON.stringify(state) + '\n');
for (const f of fs.readdirSync(PUB)) fs.copyFileSync(path.join(PUB, f), path.join(OUT, f));
fs.copyFileSync(path.join(ROOT, 'docs', 'search-flow.svg'), path.join(OUT, 'search-flow.svg'));
fs.copyFileSync(path.join(ROOT, 'docs', 'tech-flow.svg'), path.join(OUT, 'tech-flow.svg'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`Pages snapshot built into docs/: ${fs.readdirSync(OUT).length} files.`);
console.log('Enable once: repo Settings > Pages > Deploy from a branch > main, folder /docs.');
