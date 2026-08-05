#!/usr/bin/env node
'use strict';

// IndexNow connector: tells search engines about page updates the moment
// they publish, instead of waiting days for a recrawl.
//
// Honest scope: IndexNow reaches Bing, Yandex, Naver and Seznam. Google
// does NOT use IndexNow. Why it still matters: Bing's index feeds ChatGPT
// search and Microsoft Copilot, so fast Bing indexing is fast AI-engine
// visibility. Google picks up changes through the sitemap submitted in
// Search Console.
//
//   node scripts/connectors/indexnow.js                    submit all staged fix URLs
//   node scripts/connectors/indexnow.js /blog /contact     submit specific pages
//
// One-time setup (the key file):
//   1. First run generates a key into data/indexnow-key.json
//   2. Host the printed <key>.txt file at the site root (Duda: Site
//      Settings > File Manager, or push it via the API once access lands)
//   3. Rerun; submissions are accepted once the key file is live

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const HOST = 'www.wolffconstruction.com';
const keyPath = path.join(ROOT, 'data', 'indexnow-key.json');

// 1. Key: generate once, reuse forever (rotating it breaks the hosted file).
let keyData;
try {
  keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
} catch {
  keyData = { key: crypto.randomBytes(16).toString('hex'), createdAt: new Date().toISOString() };
  fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2) + '\n');
  console.log(`Generated a new IndexNow key -> data/indexnow-key.json`);
  console.log(`Host this file at the site root before submissions count:`);
  console.log(`  URL:      https://${HOST}/${keyData.key}.txt`);
  console.log(`  Contents: ${keyData.key}\n`);
}

// 2. URLs: arguments, or every staged fix from data/page-updates.json.
const argPaths = process.argv.slice(2).filter((a) => a.startsWith('/'));
const staged = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'page-updates.json'), 'utf8')).pages.map((p) => p.path);
const urls = (argPaths.length ? argPaths : staged).map((p) => `https://${HOST}${p === '/' ? '' : p}`);

(async () => {
  console.log(`Submitting ${urls.length} URLs to IndexNow (Bing, Yandex, Naver, Seznam; feeds ChatGPT search + Copilot)...`);
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: keyData.key, keyLocation: `https://${HOST}/${keyData.key}.txt`, urlList: urls }),
    });
    if (res.status === 200 || res.status === 202) {
      console.log(`Accepted (${res.status}). Engines will verify the key file and crawl.`);
      const logDir = path.join(ROOT, 'data', 'performance');
      fs.mkdirSync(logDir, { recursive: true });
      const logPath = path.join(logDir, 'indexnow-log.json');
      let log; try { log = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch { log = { submissions: [] }; }
      log.submissions.push({ at: new Date().toISOString(), count: urls.length, urls });
      fs.writeFileSync(logPath, JSON.stringify(log, null, 2) + '\n');
    } else if (res.status === 403) {
      console.log('Rejected (403): the key file is not live at the site root yet. Host it, then rerun.');
      console.log(`  https://${HOST}/${keyData.key}.txt  containing  ${keyData.key}`);
    } else if (res.status === 422 || res.status === 400) {
      console.log(`Rejected (${res.status}): ${await res.text()}`);
    } else if (res.status === 429) {
      console.log('Throttled (429): too many submissions; try again later.');
    } else {
      console.log(`Unexpected response ${res.status}.`);
    }
  } catch (e) {
    console.log(`Network blocked or unreachable (${e.message.split('\n')[0]}). Run from a machine with normal internet.`);
  }
  console.log('\nGoogle note: Google ignores IndexNow. For Google, keep the sitemap submitted');
  console.log('in Search Console; after big releases use Request Indexing on the key pages there.');
})();
