#!/usr/bin/env node
'use strict';

// Google Trends connector: seasonality for the services Wolff sells.
// No API key needed; uses the same public endpoints the Trends website
// calls. Run on a machine with normal internet.
//
//   node scripts/connectors/trends.js
//
// Pulls 5 years of interest for each service head term, scoped to
// California, averages by calendar month, and names the peak planning
// months. Writes data/performance/seasonality.json.
//
// Why it matters for a remodeler: homeowners research 2 to 4 months before
// they build. Content published INTO the research peak wins the build
// season; published after it, the season is gone. The planner worker reads
// this file to time cost guides and service page launches.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const TERMS = [
  'kitchen remodel',
  'bathroom remodel',
  'home addition',
  'ADU',
  'home renovation cost',
];
const GEO = 'US-CA';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function trendsFetch(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
  if (!res.ok) throw new Error(`trends ${res.status}`);
  const text = await res.text();
  return JSON.parse(text.slice(text.indexOf('\n') + 1)); // strip the )]}' guard line
}

async function seriesFor(term) {
  // Step 1: explore -> widget token. Step 2: widgetdata/multiline -> series.
  const req = { comparisonItem: [{ keyword: term, geo: GEO, time: 'today 5-y' }], category: 0, property: '' };
  const explore = await trendsFetch(`https://trends.google.com/trends/api/explore?hl=en-US&tz=480&req=${encodeURIComponent(JSON.stringify(req))}`);
  const widget = explore.widgets.find((w) => w.id === 'TIMESERIES');
  const data = await trendsFetch(`https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=480&req=${encodeURIComponent(JSON.stringify(widget.request))}&token=${widget.token}`);
  return data.default.timelineData.map((p) => ({ time: Number(p.time) * 1000, value: p.value[0] }));
}

(async () => {
  const terms = [];
  for (const term of TERMS) {
    process.stdout.write(`${term} (${GEO}, 5y) ... `);
    try {
      const series = await seriesFor(term);
      const byMonth = Array.from({ length: 12 }, () => []);
      for (const p of series) byMonth[new Date(p.time).getUTCMonth()].push(p.value);
      const monthly = byMonth.map((vals) => vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0);
      const ranked = monthly.map((v, i) => ({ month: MONTHS[i], interest: v })).sort((a, b) => b.interest - a.interest);
      terms.push({
        term,
        monthlyInterest: Object.fromEntries(monthly.map((v, i) => [MONTHS[i], v])),
        peakMonths: ranked.slice(0, 3).map((r) => r.month),
        quietMonths: ranked.slice(-2).map((r) => r.month),
        publishBy: ranked[0] ? `Publish content 2 to 3 months before ${ranked[0].month} to catch the research wave` : null,
      });
      console.log(`peak ${terms[terms.length - 1].peakMonths.join(', ')}`);
      await new Promise((r) => setTimeout(r, 1500)); // be polite; Trends throttles bursts
    } catch (e) {
      console.log(`failed (${e.message})`);
    }
  }

  if (!terms.length) {
    console.log('\nNo data. Google Trends throttles unofficial access sometimes: wait a few');
    console.log('minutes and rerun, or run from a normal home or office connection.');
    console.log('Fallback: the DataForSEO account also exposes Trends data via its API.');
    process.exit(0);
  }

  const outDir = path.join(ROOT, 'data', 'performance');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'seasonality.json'), JSON.stringify({
    fetchedAt: new Date().toISOString(), source: `google trends ${GEO} 5y monthly average`, terms,
  }, null, 2) + '\n');
  console.log(`\nSaved seasonality for ${terms.length} services -> data/performance/seasonality.json`);
})();
