# Work order: Deployer

Generated 2026-08-05 · cadence: on approval · mode: auto

## Mission

Run the validator; refuse on failure. Dry run the diff, apply on recorded human approval, republish, then schedule the verify crawl. Log every push with the commit hash it came from.

## Audits

The gap between approved staged changes and the live site

## Sources

- data/page-updates.json
- schema/dist/
- the Duda API

## Output contract (write ONLY these)

- the Duda draft, then production on publish
- reports/deploy-log.md

## Guardrails (from CLAUDE.md, non-negotiable)

- Every claim needs a source in data/. If it is not in a data file it does not ship.
- Never publish or record a client street address; neighborhood and city only.
- Review text verbatim from verified sources only; no paraphrase, no invention.
- Fields marked VERIFY or UNVERIFIED do not publish until a human clears them.
- No dash characters in copy. No dark backgrounds in anything rendered.
- Disambiguate from the San Francisco Wolff Construction everywhere: Rocklin or Granite Bay in every title and citation, CSLB 1056036 as the identifier.
- Branch per unit of work; the adversarial reviewer checks your PR; npm run seo:validate must pass.

## Current data snapshot

### data/page-updates.json

```json
{
  "note": "Proposed metadata for every page with a live defect. push-duda.js diffs this against data/pages.json (last crawl) and pushes only changes. Every title carries a geo token and disambiguates from the San Francisco Wolff Construction. Approve with client before --apply.",
  "redirects": [
    {
      "from": "/construction",
      "to": "/our-process",
      "reason": "Internally linked URL returns 404 (16 unique inlinks in crawl). 301 until a real destination exists."
    }
  ],
  "pages": [
    {
      "path": "/",
      "title": "Wolff Construction | Luxury Remodeling in Granite Bay & Rocklin",
      "metaDescription": "Rocklin, CA luxury remodeling contractor serving Granite Bay & Placer County. Whole home renovations, kitchens, additions & ADUs. CSLB #1056036.",
      "note": "Kills the bare 18-char brand title; wins the brand-disambiguation fight in the SERP itself"
    },
    {
      "path": "/contact",
      "title": "Contact Wolff Construction | Rocklin, CA Remodeling Contractor",
      "metaDescription": "Schedule a preconstruction consultation with Wolff Construction in Rocklin, CA. Serving Granite Bay, Roseville, Loomis, Folsom & El Dorado Hills."
    },
    {
      "path": "/our-process",
      "title": "Our Design-Build Process | Wolff Construction, Rocklin CA",
      "metaDescription": "How Wolff Construction plans, permits & builds luxury remodels in Placer County: preconstruction, design coordination, and a named PM on every job."
    },
    {
      "path": "/blog",
      "title": "Remodeling Advice for Granite Bay & Placer County | Wolff Blog",
      "metaDescription": "Cost, timeline, permit, and planning guidance for luxury remodels in Granite Bay, Rocklin & Placer County from the Wolff Construction team.",
      "note": "FIXES the live bug: /blog currently carries the careers page title and description"
    },
    {
      "path": "/silk-and-sage",
      "title": "Silk & Sage | Granite Bay Luxury Kitchen Remodel | Wolff",
      "metaDescription": "Tour Silk & Sage, a luxury kitchen remodel by Wolff Construction in Granite Bay, CA — scope, design decisions, and the team behind the build.",
      "note": "Keep the display name, add service + city; page copy also needs expansion (85 words)"
    },
    {
      "path": "/cream-and-cashmere",
      "title": "Cream & Cashmere | Granite Bay Kitchen Remodel | Wolff",
      "metaDescription": "Inside Cream & Cashmere, a Granite Bay, CA luxury kitchen remodel by Wolff Construction — layout changes, materials, and project scope.",
      "note": "Page copy needs expansion (87 words)"
    },
    {
      "path": "/sculpted-slate",
      "title": "Sculpted Slate | Granite Bay Kitchen Remodel | Wolff",
      "metaDescription": "Sculpted Slate: a luxury kitchen remodel in Granite Bay, CA by Wolff Construction. See the design decisions, finishes, and full project story.",
      "note": "Page copy needs expansion (77 words)"
    },
    {
      "path": "/the-team",
      "title": "Meet the Team | Wolff Construction, Rocklin CA",
      "metaDescription": "Meet the Wolff Construction team — founder Don Erik Wolff, Jocelyn Wolff, and lead PM Jared Schneider — building luxury remodels in Placer County."
    },
    {
      "path": "/testimonials",
      "title": "Client Reviews | Wolff Construction, Rocklin & Granite Bay",
      "metaDescription": "Read detailed client reviews of Wolff Construction — kitchen remodels, primary baths, and whole home renovations across Granite Bay & Rocklin, CA."
    },
    {
      "path": "/privacy",
      "title": "Privacy Policy | Wolff Construction",
      "metaDescription": "Privacy policy for wolffconstruction.com, the website of Wolff Construction, a Rocklin, CA remodeling contractor."
    },
    {
      "path": "/don-erik-wolff",
      "title": "Don Erik Wolff | Founder, Wolff Construction, Rocklin CA",
      "metaDescription": "Meet Don Erik Wolff, founder of Wolff Construction, a Rocklin, CA luxury remodeling contractor serving Gran
... (truncated, read data/page-updates.json for the rest)
```

### schema/dist/

```json
(missing: schema/dist/)
```

### reports/deploy-log.md

```json
(missing: reports/deploy-log.md)
```

## Definition of done

Files in the output contract updated, a summary report in reports/workers/deployer/, and a PR opened on a branch named worker/deployer. Findings ranked by impact with the exact fix attached to each.
