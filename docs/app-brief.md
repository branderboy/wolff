# Project Brief: Wolff Search Ops Console

## What this is

A local web application (runs on your machine, `npm run app`, opens in the
browser) that operationalizes the Wolff search program. It starts with
intelligence, not fixes:

```
HISTORY -> COMPETITORS -> OPPORTUNITIES -> STRUCTURE -> STAGE -> APPROVE -> PUSH -> VERIFY -> REPORT
   |            |               |              |                                              |
 crawl +     who owns      intent x service  target IA                            report feeds back
 baseline    each SERP     x market, scored  every intent                         into history
                           by winnability    gets a page
```

Nothing gets staged until the first four say it should. The intelligence
layer is data (`data/pages.json`, `data/competitors.json`,
`data/opportunities.json`, `data/site-structure.json`) so it is versioned,
reviewable, and refreshable like everything else.

Git stays the source of truth. Duda stays the deploy target. The console is
how the operator drives both without touching a terminal or the Duda editor.

## Why an app and not documents

The program lives in JSON files and scripts. That is correct for CI and
agents, and unusable for a human running a weekly cadence. The console gives
the operator (and the client, screen-shared) one place to see site health,
what is staged, what is approved, what shipped, and what moved.

## Users

1. **Operator** (you): runs the loop, stages changes, pushes to Duda.
2. **Client (Wolff)**: sees health, the 90-day plan progress, and approves
   brand claims. Read-only in practice; approval happens in conversation.

## Scope, v1

| Screen | What it does |
|---|---|
| Intelligence | Historical crawl findings, health stats, and the competitor landscape: who owns what, threat level, and Wolff's angle against each |
| Opportunities | The scored matrix: intent × service × market, demand × fit × winnability, who owns the answer today, and the play |
| Structure | The target site tree with per-node status (live/weak/staged/missing), proof and spoke counts, and the internal linking rules |
| Pages | Every crawled page: current title/description vs staged fix, defect badges |
| Validator | Run `seo:validate` on demand, grouped results by check and severity |
| 90-Day Plan | The three phases as live task boards; statuses persist to `data/plan.json` |
| Deploy | Dry-run Duda diff, schema build, gated Apply (requires credentials + explicit confirm) |

Out of scope for v1: rank tracking, GSC/GA ingestion, AI citation tracking
(manual per strategy), multi-site. The architecture leaves room for all four.

## Architecture

- **Zero dependencies.** One Node 18+ process (`app/server.js`), plain HTML/
  CSS/JS frontend (`app/public/`). Nothing to install, nothing to break.
- The server exposes the existing scripts as API endpoints — it does not
  reimplement them. One code path for CI, agents, and the console.
- Writes are limited to: `data/plan.json` (task statuses), `reports/`
  (validator output), and the Duda API (only via the gated Apply).

```
app/server.js          HTTP server + API, spawns existing scripts
app/public/index.html  single-page UI
app/public/app.css     charcoal/bronze theme
app/public/app.js      fetch + render, no framework
data/plan.json         the 90-day plan as trackable tasks
```

### API

| Route | Action |
|---|---|
| `GET  /api/state` | pages, staged updates, plan, latest validation summary |
| `POST /api/run/validate` | run validator, return findings JSON |
| `POST /api/run/schema` | rebuild `schema/dist/` from data |
| `POST /api/duda/diff` | dry-run diff of staged changes |
| `POST /api/duda/apply` | push to Duda draft; refuses without credentials AND `{confirm:true}` |
| `POST /api/plan/update` | set a task's status |

## Guardrails (same as the repo's)

- Apply is disabled until `DUDA_API_USER`/`DUDA_API_PASS`/`DUDA_SITE_NAME`
  are present in the environment, and always requires a typed confirmation.
- Nothing marked `VERIFY`/`UNVERIFIED` in data files ships; the validator
  runs before any push and a failing gate blocks Apply.
- The console never edits page content directly — content changes remain
  data commits reviewed in git.

## Milestones

| When | Deliverable |
|---|---|
| Now | v1 console: all five screens, validator + diff wired, plan board live |
| Duda access lands | Apply enabled; week-one payload shipped from the Deploy screen |
| Day 30 | Verify screen shows re-crawl delta (failures trending to zero) |
| Day 60+ | Report export (monthly numbers per `strategy/search-strategy.md`) |

## Success criteria

1. The weekly loop runs end to end from the console with zero terminal use.
2. A validator failure introduced anywhere is visible in one click.
3. The client can watch the 90-day plan move without asking for a status.
