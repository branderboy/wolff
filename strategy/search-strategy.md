# How Wolff Wins in Search: SEO, AEO, GEO

The full research lives in `research/` (site teardown, crawl export, 90-day
plan). This document is the operating strategy that this repo implements.

## The bet

Wolff runs ~19 permitted projects in three years and limits how many jobs it
takes. It cannot out-publish GVD Renovations or out-review a company with 921
reviews. A volume playbook loses, expensively.

What Wolff has is **provenance**: a named founder, a named PM, CSLB 1056036,
a top-1% permit record, NARI/NKBA membership, and deep reviews from realtors
and designers. That is exactly what AI answer engines reward and what
thin-volume competitors cannot fake.

**Volume competitors win the broad head terms. Wolff wins by becoming the
most verifiable, most specific, most human entity in the Placer County luxury
remodel space** — so that when a homeowner or an answer engine looks for the
firm that handles a $400k structural remodel with a named PM and a real
permit record, there is one obvious answer.

## Five layers, mapped to this repo

| Layer | Goal | Repo artifact |
|---|---|---|
| 1. Entity | Every engine resolves "Wolff Construction" to the Rocklin firm, never the SF firm | `data/company.json` → `schema/dist/organization.jsonld` + person nodes, geo-carrying titles in `data/page-updates.json` |
| 2. Evidence | Every claim backed by a verifiable artifact | `data/reviews.json` (tagged, sourced), license/permit facts in `data/company.json`, validator blocks unsourced Review schema |
| 3. Answer (AEO) | Own the question set a $150k-$500k homeowner asks, in extractable format | `data/questions.json` (6 clusters, cost first), FAQPage shells in `schema/dist/`, extraction rules in `CLAUDE.md` |
| 4. Retrieval (GEO) | Exist in the sources answer engines actually pull from | Priority list below; partner/profile URLs tracked in `data/company.json` sameAs |
| 5. Qualification | 2-4 qualified consults/month, not traffic | Filters in `data/company.json` positioning; CTA rules in `CLAUDE.md` |

## Retrieval priorities (Layer 4)

1. **Houzz** — urgent: the SF Wolff owns the brand real estate there. Claim
   and build the Rocklin profile.
2. **Google Business Profile** — Rocklin address, weekly posts, Q&A seeded
   from the cost/timeline clusters, geotagged project photos, owner-voice
   review responses.
3. **NARI / NKBA member directories** — full profiles, not stubs.
4. **Partner links** — designers, realtors, cabinet shops, architects (Nar
   Design Group is named in a review; verify and develop).
5. **YouTube** — case-study walkthroughs narrated by Don Erik, with
   transcripts (retrievable text).
6. **Local press** — Sacramento Magazine, Comstock's, Placer County features.
7. **Reddit/forums** — real answers from a real account; slow but heavily
   cited by generative engines.

**Kill:** the syndicated press-release program. Identical articles on
pr.capitalpress.com / pr.rivertonjournal.com buy nothing; the budget moves to
items 1-6.

## Measurement (not sessions)

- Branded query volume for "Wolff Construction Rocklin" vs the SF firm
  (entity resolution working)
- Citation share in AI Overviews / ChatGPT / Perplexity for the target
  question set (the GEO scoreboard, tracked monthly by hand if needed)
- Consultation requests with stated budget above minimum (quality, not count)
- Local pack position: kitchen remodel / home addition / ADU builder in
  Rocklin and Granite Bay
- Assisted conversions from Houzz and GBP

## The CMS connection

Duda has no SSH, FTP, file system, or git remote. The bridge is the Duda
REST API, driven from this repo:

```
data/ + templates/  →  scripts/build-schema.js  →  schema/dist/
data/page-updates.json  →  scripts/push-duda.js  →  Duda API  →  publish
```

- `npm run duda:diff` — show pending changes vs the last crawl (dry run)
- `npm run duda:push` — push page titles/descriptions to the Duda draft
- `npm run duda:push:all` — also inject entity schema site-wide and republish
- `npm run seo:validate` — CI gate; blocks any merge that reintroduces a
  known failure class

Day-one dependency: API credentials live with the Duda account owner
(Bullsai). If access is refused, git remains the source of truth and
publishing stays manual — the data layer, validator, and reports keep their
full value. Fallback paths (WordPress/VPS migration, parallel proof property)
are documented in `research/Construction website.docx`.

## Sequence

1. Find out who controls the Duda account. Everything branches off that.
2. The repo, data layer, and validator are built (this branch) — run
   `npm run seo:report` and hand the client the failure report the incumbent
   never produced.
3. Get the same-day fixes approved and pushed: `/blog` metadata, homepage
   title, NAP on contact, entity schema, og:image, blog in nav.
4. Weeks 2-6: the three missing service pages, `/projects` hub, re-slugged
   case studies, testimonials with sourced AggregateRating.
5. Then city pages, cost content, and the retrieval layer per the 90-day
   plan in `research/profile-and-plan.md`.
