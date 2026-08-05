#!/usr/bin/env node
'use strict';

// DataForSEO connector: real search volumes and difficulty for every target
// query in data/opportunities.json. Replaces judgment demand scores with
// measured ones.
//
//   DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD in .env
//   node scripts/connectors/dataforseo.js
//
// Writes data/performance/volumes.json and rescores opportunities: each
// demand score gets {measured: true, volume} attached.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASS = process.env.DATAFORSEO_PASSWORD;

const oppsPath = path.join(ROOT, 'data', 'opportunities.json');
const opps = JSON.parse(fs.readFileSync(oppsPath, 'utf8'));
const queries = [...new Set(opps.opportunities.flatMap((o) => o.query.split(' / ').map((q) => q.trim())))];

if (!LOGIN || !PASS) {
  console.log(`Not connected. ${queries.length} target queries are ready to price.`);
  console.log('Setup: create a DataForSEO account (pay as you go), put DATAFORSEO_LOGIN and');
  console.log('DATAFORSEO_PASSWORD in .env, rerun. Cost for this batch: well under $1.');
  process.exit(0);
}

(async () => {
  const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${LOGIN}:${PASS}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ keywords: queries, location_name: 'United States', language_name: 'English' }]),
  });
  if (!res.ok) throw new Error(`DataForSEO ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const rows = data.tasks?.[0]?.result || [];

  const outDir = path.join(ROOT, 'data', 'performance');
  fs.mkdirSync(outDir, { recursive: true });
  const volumes = Object.fromEntries(rows.map((r) => [r.keyword, {
    volume: r.search_volume, cpc: r.cpc, competition: r.competition,
  }]));
  fs.writeFileSync(path.join(outDir, 'volumes.json'), JSON.stringify({
    fetchedAt: new Date().toISOString(), source: 'dataforseo google_ads search_volume', volumes,
  }, null, 2) + '\n');

  // Rescore: demand 1-5 from measured volume bands, marked measured.
  for (const o of opps.opportunities) {
    const qs = o.query.split(' / ').map((q) => q.trim());
    const vol = Math.max(...qs.map((q) => volumes[q]?.volume ?? -1));
    if (vol >= 0) {
      o.measuredVolume = vol;
      o.demand = vol >= 1000 ? 5 : vol >= 300 ? 4 : vol >= 100 ? 3 : vol >= 30 ? 2 : 1;
      o.demandSource = 'measured';
      o.score = o.demand * o.fit * o.winnability;
    }
  }
  fs.writeFileSync(oppsPath, JSON.stringify(opps, null, 2) + '\n');
  console.log(`Priced ${rows.length} queries. Volumes -> data/performance/volumes.json; opportunity scores rescored as measured.`);
})().catch((e) => { console.error(e.message); process.exit(1); });
