#!/usr/bin/env node
'use strict';

// Wolff Search Ops Console — local server.
// Zero dependencies. Wraps the existing scripts/ as API endpoints; it never
// reimplements them, so CI, agents, and the console share one code path.
//
//   npm run app   ->  http://localhost:4600

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(__dirname, 'public');
const PORT = process.env.PORT || 4600;

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };

function readJson(rel, fallback = null) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
  catch { return fallback; }
}

function runScript(scriptArgs, cb) {
  execFile('node', scriptArgs, { cwd: ROOT, timeout: 120000, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
    cb({ ok: !err || typeof err.code === 'number', exitCode: err ? err.code ?? 1 : 0, stdout: String(stdout), stderr: String(stderr) });
  });
}

function send(res, code, body, type = 'application/json') {
  const data = type === 'application/json' ? JSON.stringify(body) : body;
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(data);
}

function body(req, cb) {
  let raw = '';
  req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on('end', () => { try { cb(raw ? JSON.parse(raw) : {}); } catch { cb({}); } });
}

const routes = {
  'GET /api/state': (req, res) => {
    const pages = readJson('data/pages.json', { pages: [] });
    const updates = readJson('data/page-updates.json', { pages: [], redirects: [] });
    const plan = readJson('data/plan.json', { phases: [] });
    const validation = readJson('reports/seo-failures.json');
    const company = readJson('data/company.json', {});
    const competitors = readJson('data/competitors.json', { competitors: [] });
    const opportunities = readJson('data/opportunities.json', { opportunities: [] });
    const structure = readJson('data/site-structure.json', { tree: [], linkingRules: [] });
    const dudaReady = Boolean(process.env.DUDA_API_USER && process.env.DUDA_API_PASS && process.env.DUDA_SITE_NAME);
    const recommendations = readJson('data/page-recommendations.json', { pages: [] });
    const perf = (rel) => { try { return fs.statSync(path.join(ROOT, 'data', 'performance', rel)).mtime.toISOString().slice(0, 10); } catch { return null; } };
    const connections = [
      { id: 'duda', name: 'Duda (your website)', feeds: 'Publishing fixes to the site', ready: Boolean(process.env.DUDA_API_USER && process.env.DUDA_API_PASS && process.env.DUDA_SITE_NAME), lastData: null, setup: 'API keys from Bullsai; the day one ask' },
      { id: 'gsc', name: 'Google Search Console', feeds: 'Real searches you already appear for', ready: Boolean(process.env.GSC_SITE_URL && process.env.GOOGLE_APPLICATION_CREDENTIALS), lastData: perf('gsc-queries.json'), setup: 'Free. CSV export works with zero setup: npm run connect:gsc' },
      { id: 'volumes', name: 'DataForSEO', feeds: 'Search volumes for every target query', ready: Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD), lastData: perf('volumes.json'), setup: 'Pay as you go, under $1 for this set: npm run connect:volumes' },
      { id: 'speed', name: 'PageSpeed Insights', feeds: 'Site speed scores per page', ready: true, lastData: perf('speed.json'), setup: 'Free, works now: npm run connect:speed' },
      { id: 'semantic', name: 'Embeddings (Voyage or OpenAI)', feeds: 'Which page best matches each search; gaps and overlap', ready: Boolean(process.env.VOYAGE_API_KEY || process.env.OPENAI_API_KEY), lastData: perf('semantic-map.json'), setup: 'Either key works, Voyage free tier or your OpenAI key: npm run connect:semantic' },
      { id: 'citations', name: 'Citation checker', feeds: 'Your profiles across the web say Rocklin and match your NAP', ready: true, lastData: perf('sameas-audit.json'), setup: 'No key needed: npm run connect:citations' },
      { id: 'trends', name: 'Google Trends', feeds: 'When Californians research each service; the months to publish into', ready: true, lastData: perf('seasonality.json'), setup: 'No key needed: npm run connect:trends' },
      { id: 'indexnow', name: 'IndexNow', feeds: 'Instant indexing of published fixes on Bing, which feeds ChatGPT search and Copilot', ready: true, lastData: perf('indexnow-log.json'), setup: 'One key file hosted at the site root, then: npm run connect:indexnow' },
    ];
    const workers = readJson('data/workers.json', { workers: [] });
    for (const w of workers.workers) {
      try {
        w.lastOrder = fs.statSync(path.join(ROOT, 'reports', 'workers', w.id, 'workorder.md')).mtime.toISOString().slice(0, 10);
      } catch { w.lastOrder = null; }
    }
    send(res, 200, { pages, updates, plan, validation, dudaReady, competitors, opportunities, structure, workers, recommendations, connections, company: { displayName: company.displayName, license: company.license } });
  },

  'POST /api/run/validate': (req, res) => {
    runScript(['scripts/seo-validate.js', '--json', 'reports/seo-failures.json', '--report', 'reports/seo-failures.md'], (r) => {
      const validation = readJson('reports/seo-failures.json');
      send(res, 200, { ...r, validation });
    });
  },

  'POST /api/run/schema': (req, res) => {
    runScript(['scripts/build-schema.js'], (r) => send(res, 200, r));
  },

  'POST /api/run/import': (req, res) => {
    runScript(['scripts/import-crawl.js'], (r) => send(res, 200, r));
  },

  'POST /api/duda/diff': (req, res) => {
    runScript(['scripts/push-duda.js'], (r) => send(res, 200, r));
  },

  'POST /api/duda/apply': (req, res) => {
    if (!(process.env.DUDA_API_USER && process.env.DUDA_API_PASS && process.env.DUDA_SITE_NAME)) {
      return send(res, 400, { ok: false, error: 'Duda credentials not set. Add DUDA_API_USER, DUDA_API_PASS, DUDA_SITE_NAME to the environment (see .env.example). This is the day-one ask to the Duda account owner.' });
    }
    body(req, (b) => {
      if (b.confirm !== 'PUSH TO WOLFF') {
        return send(res, 400, { ok: false, error: 'Type PUSH TO WOLFF to confirm. Changes go to the Duda draft, not live, unless publish is also requested.' });
      }
      // Gate: validator must pass on staged data before any push.
      runScript(['scripts/seo-validate.js'], (v) => {
        if (v.exitCode !== 0 && b.force !== true) {
          return send(res, 409, { ok: false, error: 'seo:validate is failing. Fix failures (or acknowledge with force) before pushing.', validator: v.stdout.slice(-2000) });
        }
        const args = ['scripts/push-duda.js', '--apply'];
        if (b.schema) args.push('--schema');
        if (b.publish) args.push('--publish');
        runScript(args, (r) => send(res, 200, r));
      });
    });
  },

  'POST /api/worker/run': (req, res) => {
    body(req, (b) => {
      const roster = readJson('data/workers.json', { workers: [] }).workers;
      if (!roster.some((w) => w.id === b.id)) return send(res, 404, { ok: false, error: 'unknown worker' });
      runScript(['scripts/run-worker.js', b.id], (r) => {
        let order = '';
        try { order = fs.readFileSync(path.join(ROOT, 'reports', 'workers', b.id, 'workorder.md'), 'utf8'); } catch {}
        send(res, 200, { ...r, order });
      });
    });
  },

  'POST /api/plan/update': (req, res) => {
    body(req, (b) => {
      const plan = readJson('data/plan.json');
      if (!plan) return send(res, 500, { ok: false, error: 'data/plan.json missing' });
      let found = false;
      for (const phase of plan.phases) {
        for (const task of phase.tasks) {
          if (task.id === b.taskId) {
            task.status = ['todo', 'in_progress', 'done', 'blocked'].includes(b.status) ? b.status : task.status;
            found = true;
          }
        }
      }
      if (!found) return send(res, 404, { ok: false, error: 'task not found' });
      fs.writeFileSync(path.join(ROOT, 'data', 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
      send(res, 200, { ok: true, plan });
    });
  },
};

const server = http.createServer((req, res) => {
  const key = `${req.method} ${req.url.split('?')[0]}`;
  if (routes[key]) return routes[key](req, res);

  // static
  let rel = req.url.split('?')[0];
  if (rel === '/') rel = '/index.html';
  const file = path.join(PUB, path.normalize(rel));
  if (!file.startsWith(PUB)) return send(res, 403, { error: 'forbidden' });
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: 'not found' });
    send(res, 200, data, MIME[path.extname(file)] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log(`Wolff Search Ops Console -> http://localhost:${PORT}`);
  console.log(`Duda credentials ${process.env.DUDA_API_USER ? 'present' : 'NOT set (Apply disabled; diff and everything else works)'}`);
});
