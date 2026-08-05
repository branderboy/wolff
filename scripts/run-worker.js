#!/usr/bin/env node
'use strict';

// Generates the work order for an AI worker (and runs local automation for
// mode:auto workers). The work order is a complete, self-contained brief a
// Claude or Codex agent executes:
//
//   node scripts/run-worker.js gbp-auditor
//   claude -p "$(cat reports/workers/gbp-auditor/workorder.md)"
//
// Workers write only to data/ and reports/. The validator and human
// approval still gate everything that ships.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const roster = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'workers.json'), 'utf8')).workers;

const id = process.argv[2];
const worker = roster.find((w) => w.id === id);
if (!worker) {
  console.error(`Unknown worker. Available: ${roster.map((w) => w.id).join(', ')}`);
  process.exit(1);
}

const outDir = path.join(ROOT, 'reports', 'workers', worker.id);
fs.mkdirSync(outDir, { recursive: true });

function fileExcerpt(rel, max = 4000) {
  try {
    const t = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    return t.length > max ? t.slice(0, max) + `\n... (truncated, read ${rel} for the rest)` : t;
  } catch { return `(missing: ${rel})`; }
}

// Data context: every repo file this worker reads or writes.
const repoFiles = [...new Set([...worker.sources, ...worker.writes]
  .map((s) => (s.match(/^(data|reports|schema)\/[\w./*-]+/) || [])[0])
  .filter(Boolean)
  .map((s) => s.replace(/ .*/, ''))
  .filter((s) => !s.includes('*')))];

const order = `# Work order: ${worker.name}

Generated ${new Date().toISOString().slice(0, 10)} · cadence: ${worker.cadence} · mode: ${worker.mode}

## Mission

${worker.brief}

## Audits

${worker.audits}

## Sources

${worker.sources.map((s) => `- ${s}`).join('\n')}

## Output contract (write ONLY these)

${worker.writes.map((s) => `- ${s}`).join('\n')}

## Guardrails (from CLAUDE.md, non-negotiable)

- Every claim needs a source in data/. If it is not in a data file it does not ship.
- Never publish or record a client street address; neighborhood and city only.
- Review text verbatim from verified sources only; no paraphrase, no invention.
- Fields marked VERIFY or UNVERIFIED do not publish until a human clears them.
- No dash characters in copy. No dark backgrounds in anything rendered.
- Disambiguate from the San Francisco Wolff Construction everywhere: Rocklin or Granite Bay in every title and citation, CSLB 1056036 as the identifier.
- Branch per unit of work; the adversarial reviewer checks your PR; npm run seo:validate must pass.

## Current data snapshot

${repoFiles.map((f) => `### ${f}\n\n\`\`\`json\n${fileExcerpt(f)}\n\`\`\``).join('\n\n')}

## Definition of done

Files in the output contract updated, a summary report in reports/workers/${worker.id}/, and a PR opened on a branch named worker/${worker.id}. Findings ranked by impact with the exact fix attached to each.
`;

const orderPath = path.join(outDir, 'workorder.md');
fs.writeFileSync(orderPath, order);
console.log(`Work order -> reports/workers/${worker.id}/workorder.md`);

if (worker.mode === 'auto' && Array.isArray(worker.auto)) {
  for (const cmd of worker.auto) {
    const [bin, ...args] = cmd.split(' ');
    console.log(`\n$ ${cmd}`);
    try {
      console.log(execFileSync(bin, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
    } catch (e) {
      console.log((e.stdout || '') + (e.stderr || ''));
      console.log(`(exit ${e.status}) automation halted; fix and rerun`);
      break;
    }
  }
} else {
  console.log(`Run it with an agent:\n  claude -p "$(cat reports/workers/${worker.id}/workorder.md)"`);
}
