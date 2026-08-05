#!/usr/bin/env node
'use strict';

// sameAs connector: audits the citation graph that tells Google and AI
// engines which Wolff Construction this is. Checks every profile URL in
// data/company.json: does it resolve, does it say Rocklin, does the NAP
// match. Placeholders are reported as unclaimed profiles.
//
//   node scripts/connectors/sameas.js      (no key needed; run on a machine
//                                           with normal internet)
//
// Writes data/performance/sameas-audit.json. Every verified URL can then be
// promoted into the entity schema by schema:build; placeholders stay out.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const company = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'company.json'), 'utf8'));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36';

(async () => {
  const results = [];
  for (const url of company.sameAs) {
    if (url.includes('PLACEHOLDER')) {
      results.push({ url, status: 'unclaimed', note: 'Profile not yet claimed or URL not recorded. Claiming it is a task, not a lookup.' });
      continue;
    }
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      const html = res.ok ? await res.text() : '';
      const mentionsRocklin = /rocklin/i.test(html);
      const mentionsAddress = company.address.street ? html.includes(company.address.street) : false;
      const mentionsLicense = html.includes(company.license.number);
      results.push({
        url, status: res.ok ? 'live' : `http ${res.status}`,
        mentionsRocklin, mentionsAddress, mentionsLicense,
        verdict: res.ok && mentionsRocklin ? 'good citation' : res.ok ? 'WEAK: does not say Rocklin, does not disambiguate from the SF Wolff' : 'broken',
      });
    } catch (e) {
      results.push({ url, status: 'unreachable', note: e.message.split('\n')[0] });
    }
  }

  const outDir = path.join(ROOT, 'data', 'performance');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'sameas-audit.json'), JSON.stringify({
    fetchedAt: new Date().toISOString(), results,
  }, null, 2) + '\n');

  const good = results.filter((r) => r.verdict === 'good citation').length;
  const unclaimed = results.filter((r) => r.status === 'unclaimed').length;
  console.log(`${results.length} profiles checked: ${good} good citations, ${unclaimed} unclaimed, rest weak or broken.`);
  console.log('-> data/performance/sameas-audit.json');
})();
