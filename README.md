# Wolff Construction — Search Operating System

The operating record for the Wolff Construction (Rocklin, CA) search program:
SEO, AEO (answer engine optimization), and GEO (generative engine
optimization), with a CI-gated pipeline that deploys to the Duda CMS at scale.

**Why this exists:** the live site shipped `/blog` with the careers page title
("Join Wolff Construction Team") and it was indexed that way. Ten pages share
a bare 18-character brand title while an identically named San Francisco firm
wins the brand SERP. No human caught any of it. This repo makes that class of
error impossible to merge.

## Quick start

```bash
npm run crawl:import      # Screaming Frog CSV -> data/pages.json
npm run seo:validate      # the CI gate (exit 1 on any failure)
npm run seo:report        # same, plus reports/seo-failures.md
npm run schema:build      # data/ -> schema/dist/*.jsonld
npm run duda:diff         # show pending page changes (dry run)
npm run duda:push         # push approved changes to the Duda draft
```

No dependencies — plain Node 18+. Duda credentials go in `.env` (see
`.env.example`); they live with the Duda account owner and are never
committed.

## Current state

`reports/seo-failures.md` is the validator's output against the live site:
**35 failures across 27 pages**, every one indexed in production. The fix
payload for all of them is staged in `data/page-updates.json`, ready to
review and push.

## How it fits together

```
research/          the audit, crawl export, job context, 90-day plan
strategy/          the operating strategy (5 layers: entity, evidence,
                   answer, retrieval, qualification)
data/              source of truth for every fact that ships
templates/         page templates rendered from data, never hand-written
schema/dist/       generated JSON-LD (organization, people, services, FAQs)
scripts/           import -> validate -> build -> push
reports/           generated failure reports
CLAUDE.md          agent rules (AGENTS.md mirrors it for Codex)
.github/workflows/ the SEO regression gate, run on every PR
```

Git is the source of truth. Duda has no SSH, FTP, or git remote — the Duda
REST API (`scripts/push-duda.js`) is the bridge, giving diffs, review,
rollback, and history on a platform that natively offers none of that.

**Built for many sites, not one.** Nothing here is hand built for this
client: facts live in data files, pages render from templates, and the
validator, console, workers, and connectors are all parameterized by those
files. Onboarding the next contractor site is clone, import crawl, fill in
the data files — the same audit and pipeline exist for that client within a
day. See `docs/application.md` for the full mapping to the job thesis.

## Rules

All content and claim rules live in [CLAUDE.md](CLAUDE.md). The short
version: every claim needs a source in `data/`, every title carries a geo
token, nothing marked UNVERIFIED ships, and one agent implements while a
second reviews.
