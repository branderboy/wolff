# Wolff Construction — Agent Rules (Codex mirror of CLAUDE.md)

This repo is the operating record for the Wolff Construction search program
(SEO + AEO + GEO). Git is the source of truth; the Duda site is a deploy
target. Agents edit data and templates here — never prose in the Duda editor.

## Who this client is

Rocklin, CA luxury residential remodeler. CSLB 1056036. Low-volume by design
(~19 permitted projects in three years, top 1% of CA contractors per
BuildZoom). Founder: Don Erik Wolff. Lead PM: Jared Schneider.

There is ANOTHER Wolff Construction in San Francisco (founded by Max Wolff).
Every title, schema entity, and citation must carry Rocklin or Granite Bay to
disambiguate. Never let content blur the two.

## Strategy in one line

Proof over volume. Wolff cannot out-publish or out-review volume competitors
(GVD has 921 reviews). Wolff wins by being the most verifiable, most
specific, most human entity in the Placer County luxury remodel space.

## Hard content rules

1. **Every claim needs a source in `data/`.** No stat, review, project
   detail, rating, or permit number appears in any page, schema block, or
   meta description unless it exists in a data file. If it's not in
   `data/`, it doesn't ship.
2. **Never publish a client street address for a project.** Neighborhood and
   city only.
3. **No invented reviews, no paraphrased reviews.** Review text comes
   verbatim from `data/reviews.json`, which is populated only from verified
   live sources.
4. **Fields marked `VERIFY` or `UNVERIFIED` in data files must not be
   published** until a human confirms them and removes the flag.
5. **Banned language:** "living masterpiece", "every moment, elevated",
   "sanctuaries", "unparalleled", "seamless experience", "elevate your
   lifestyle" — and any adjective that cannot be falsified. Replace vague
   claims with verifiable specifics (license number, permit record, named
   PM, member directory link).
6. **No dash characters in body copy.** House style.
7. **Qualification over volume.** CTAs are "preconstruction consultation",
   never "free estimate". Content states minimum budget and what Wolff does
   NOT take (small repairs, cosmetic-only, investor flips, no-design jobs).

## Page standards (enforced by `npm run seo:validate`)

- Title: 25-65 chars, must contain a geo token (see `data/cities.json`)
  unless the page is in the exempt list. Unique across the site.
- Meta description: 70-160 chars, unique across the site.
- Exactly one H1 per page.
- No meta keywords tag.
- og:image is a real project photo, never the favicon.
  twitter:card = summary_large_image.
- Valid JSON-LD on every page; Review/AggregateRating markup requires a
  matching verified row in `data/reviews.json`.
- Indexable marketing pages: 300+ words. Project pages: 600+.
- AEO extraction format: question-shaped H2s, direct answer in the first
  40-60 words, numbers in tables not prose, answers attributed to a named
  team member ("Jared Schneider, lead project manager, says...").

## Workflow

- Branch per unit of work: `content/granite-bay-kitchen`,
  `schema/localbusiness`, `fix/blog-title`. One page or one fix per PR.
- Generation, not writing: pages render from `templates/` + `data/` via
  build scripts. Content changes are data commits.
- Adversarial review: one agent implements, a second reviews the PR against
  this file and the data files. Flag unsourced claims, voice drift, and
  schema errors. Alternate roles.
- `npm run seo:validate` must pass before merge. CI runs it on every PR.
- Human approval required for: project facts, brand claims, anything
  touching `data/company.json`, and every `push-duda.js --apply`.

## Repo map

- `data/` — facts: company entity, services, cities, reviews, questions,
  crawled pages, pending page updates
- `templates/` — page templates rendered from data
- `schema/dist/` — generated JSON-LD (run `npm run schema:build`; never
  hand-edit)
- `scripts/` — import, validate, build, and Duda push
- `research/` — the original audit, crawl export, and 90-day plan
- `strategy/` — the operating strategy
- `reports/` — generated validation reports
