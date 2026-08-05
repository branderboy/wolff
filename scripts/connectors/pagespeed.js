#!/usr/bin/env node
'use strict';

// Site speed connector: Google PageSpeed Insights (Lighthouse run from
// Google's servers) for the pages that matter. Free; an API key just raises
// the rate limit.
//
//   PSI_API_KEY in .env (optional: console.cloud.google.com > enable PageSpeed Insights API)
//   node scripts/connectors/pagespeed.js
//
// Writes data/performance/speed.json: performance score, LCP, CLS, TBT per
// page, both mobile and desktop. The audit already flagged the autoplay hero
// video as a likely mobile LCP problem; this measures it.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const KEY = process.env.PSI_API_KEY;

const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pages.json'), 'utf8')).pages
  .filter((p) => p.statusCode === 200);
// Key templates first: home, one project, one blog post, contact.
const targets = ['/', '/silk-and-sage', '/what-does-a-luxury-kitchen-remodel-look-like-in-granite-bay', '/contact']
  .map((t) => pages.find((p) => p.path === t)).filter(Boolean);

(async () => {
  const results = [];
  for (const p of targets) {
    for (const strategy of ['mobile', 'desktop']) {
      const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(p.url)}&strategy=${strategy}${KEY ? `&key=${KEY}` : ''}`;
      process.stdout.write(`${strategy} ${p.path} ... `);
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) { console.log(data.error.message.split('.')[0]); continue; }
        const lh = data.lighthouseResult;
        const audits = lh.audits;
        results.push({
          path: p.path, strategy,
          performance: Math.round((lh.categories.performance.score || 0) * 100),
          lcp: audits['largest-contentful-paint']?.displayValue,
          cls: audits['cumulative-layout-shift']?.displayValue,
          tbt: audits['total-blocking-time']?.displayValue,
          lcpElement: audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet || null,
        });
        console.log(`score ${results[results.length - 1].performance}`);
      } catch (e) { console.log(e.message.split('\n')[0]); }
    }
  }
  if (!results.length) {
    console.log('\nNo results (rate limit or network). Add PSI_API_KEY to .env and rerun.');
    process.exit(0);
  }
  const outDir = path.join(ROOT, 'data', 'performance');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'speed.json'), JSON.stringify({
    fetchedAt: new Date().toISOString(), source: 'pagespeed insights v5', results,
  }, null, 2) + '\n');
  console.log(`\nSaved ${results.length} measurements -> data/performance/speed.json`);
})();
