#!/usr/bin/env node
'use strict';

// Google Search Console connector: what Google is ALREADY showing Wolff for.
// Two paths, use whichever lands first:
//
//   1. CSV export (zero setup): Search Console > Performance > Export >
//      Download CSV, then:  node scripts/connectors/gsc.js --csv Queries.csv
//   2. API (weekly automation): service account JSON added as a user in the
//      Search Console property, GSC_SITE_URL and GOOGLE_APPLICATION_CREDENTIALS
//      in .env, then run with no arguments.
//
// Writes data/performance/gsc-queries.json. The console and the
// recommendations builder read it to show which target searches already get
// impressions.

const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../lib/csv');

const ROOT = path.join(__dirname, '..', '..');
const outDir = path.join(ROOT, 'data', 'performance');

const csvIdx = process.argv.indexOf('--csv');

function write(rows, source) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'gsc-queries.json'), JSON.stringify({
    fetchedAt: new Date().toISOString(), source, rows,
  }, null, 2) + '\n');
  console.log(`Saved ${rows.length} query rows -> data/performance/gsc-queries.json`);
}

(async () => {
  if (csvIdx > -1) {
    const raw = parseCsv(fs.readFileSync(process.argv[csvIdx + 1], 'utf8'));
    const rows = raw.map((r) => ({
      query: r['Top queries'] || r['Query'] || r['query'],
      clicks: Number(r['Clicks'] || 0),
      impressions: Number(r['Impressions'] || 0),
      ctr: r['CTR'] || null,
      position: Number(r['Position'] || 0),
    })).filter((r) => r.query);
    return write(rows, 'csv export');
  }

  const site = process.env.GSC_SITE_URL;
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!site || !credsPath) {
    console.log('Not connected. Either:');
    console.log('  a) Export queries CSV from Search Console and run: node scripts/connectors/gsc.js --csv Queries.csv');
    console.log('  b) Set GSC_SITE_URL + GOOGLE_APPLICATION_CREDENTIALS (service account with');
    console.log('     Search Console access) in .env for weekly automated pulls.');
    process.exit(0);
  }

  // Service account JWT -> access token -> Search Analytics query. Zero deps.
  const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })}`;
  const sign = require('crypto').createSign('RSA-SHA256');
  sign.update(unsigned);
  const jwt = `${unsigned}.${sign.sign(creds.private_key).toString('base64url')}`;

  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token } = await tokRes.json();
  if (!access_token) throw new Error('Could not get a Google access token; check the service account.');

  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['query', 'page'], rowLimit: 5000 }),
  });
  if (!qRes.ok) throw new Error(`GSC API ${qRes.status}: ${await qRes.text()}`);
  const data = await qRes.json();
  write((data.rows || []).map((r) => ({
    query: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position,
  })), `api ${start}..${end}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
