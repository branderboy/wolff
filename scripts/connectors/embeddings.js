#!/usr/bin/env node
'use strict';

// Embeddings connector: semantic match between target searches and pages.
// Anthropic has no embeddings endpoint; Voyage AI is the embeddings provider
// recommended for Claude pipelines.
//
//   VOYAGE_API_KEY in .env (voyageai.com; generous free tier)
//   node scripts/connectors/embeddings.js
//
// Embeds every opportunity query and every page (title + description), then
// writes data/performance/semantic-map.json:
//   - bestPage per query: which page Google most likely serves for it
//   - gap queries: no page scores above threshold (page must be built)
//   - cannibalization: two+ pages scoring nearly identically for one query

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const KEY = process.env.VOYAGE_API_KEY;

const opps = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'opportunities.json'), 'utf8')).opportunities;
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pages.json'), 'utf8')).pages
  .filter((p) => p.statusCode === 200);

if (!KEY) {
  console.log(`Not connected. Ready to map ${opps.length} target searches against ${pages.length} pages.`);
  console.log('Setup: get a key at voyageai.com (Anthropic\'s recommended embeddings partner,');
  console.log('free tier covers this), put VOYAGE_API_KEY in .env, rerun.');
  process.exit(0);
}

async function embed(texts) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: texts, model: 'voyage-3.5', input_type: 'document' }),
  });
  if (!res.ok) throw new Error(`Voyage ${res.status}: ${await res.text()}`);
  return (await res.json()).data.map((d) => d.embedding);
}

const cos = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

(async () => {
  const queryTexts = opps.map((o) => o.query);
  const pageTexts = pages.map((p) => `${p.title}. ${p.metaDescription}`.trim());
  const [qVecs, pVecs] = [await embed(queryTexts), await embed(pageTexts)];

  const map = opps.map((o, i) => {
    const scored = pages.map((p, j) => ({ path: p.path, similarity: +cos(qVecs[i], pVecs[j]).toFixed(3) }))
      .sort((a, b) => b.similarity - a.similarity);
    const [best, second] = scored;
    return {
      query: o.query,
      targetUrl: o.targetUrl,
      bestPage: best,
      runnerUp: second,
      gap: best.similarity < 0.55,
      cannibalization: second && best.similarity - second.similarity < 0.03 && best.similarity >= 0.55,
    };
  });

  const outDir = path.join(ROOT, 'data', 'performance');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'semantic-map.json'), JSON.stringify({
    fetchedAt: new Date().toISOString(), model: 'voyage-3.5', map,
  }, null, 2) + '\n');

  const gaps = map.filter((m) => m.gap).length;
  const cann = map.filter((m) => m.cannibalization).length;
  console.log(`Mapped ${map.length} searches. ${gaps} have no matching page (build them); ${cann} have two pages competing (merge or differentiate).`);
  console.log('-> data/performance/semantic-map.json');
})().catch((e) => { console.error(e.message); process.exit(1); });
