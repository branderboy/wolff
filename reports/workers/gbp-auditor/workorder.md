# Work order: GBP Auditor

Generated 2026-08-05 · cadence: monthly · mode: agent

## Mission

Audit the Wolff Construction GBP as a customer and as an engine. Score: correct categories for luxury remodeling; services list matching data/services.json; photos of real projects with geotags; Q&A seeded with the cost and timeline questions from data/questions.json; every review answered in the owner voice; exact NAP match with the site and every citation. Flag anything that conflicts with the Rocklin entity or leaks toward the San Francisco Wolff. Output: findings ranked by impact, each with the exact fix.

## Audits

Google Business Profile: categories, services, hours, photos and geotags, Q&A, review velocity and owner responses, NAP match against data/company.json

## Sources

- Google Business Profile listing
- Google Maps local pack for target queries
- data/company.json
- data/questions.json

## Output contract (write ONLY these)

- reports/workers/gbp-audit.md
- data/plan.json tasks under phase-1

## Guardrails (from CLAUDE.md, non-negotiable)

- Every claim needs a source in data/. If it is not in a data file it does not ship.
- Never publish or record a client street address; neighborhood and city only.
- Review text verbatim from verified sources only; no paraphrase, no invention.
- Fields marked VERIFY or UNVERIFIED do not publish until a human clears them.
- No dash characters in copy. No dark backgrounds in anything rendered.
- Disambiguate from the San Francisco Wolff Construction everywhere: Rocklin or Granite Bay in every title and citation, CSLB 1056036 as the identifier.
- Branch per unit of work; the adversarial reviewer checks your PR; npm run seo:validate must pass.

## Current data snapshot

### data/company.json

```json
{
  "legalName": "Wolff Construction LLC",
  "displayName": "Wolff Construction",
  "disambiguator": "Rocklin, CA luxury residential remodeler (NOT the San Francisco firm founded by Max Wolff)",
  "url": "https://www.wolffconstruction.com",
  "license": {
    "type": "CSLB",
    "number": "1056036",
    "verifyUrl": "https://www.cslb.ca.gov/onlineservices/checklicenseII/LicenseDetail.aspx?LicNum=1056036",
    "activeSince": "2018"
  },
  "address": {
    "street": "5828 Lonetree Blvd",
    "city": "Rocklin",
    "region": "CA",
    "postalCode": "95765",
    "country": "US",
    "source": "BuildZoom public listing — VERIFY with client before publishing",
    "verified": false
  },
  "geo": {
    "latitude": null,
    "longitude": null,
    "note": "Fill after NAP is confirmed with client"
  },
  "phone": null,
  "email": null,
  "foundingDate": "2018",
  "people": [
    {
      "name": "Don Erik Wolff",
      "role": "Founder",
      "slug": "don-erik-wolff",
      "url": "https://www.wolffconstruction.com/don-erik-wolff"
    },
    {
      "name": "Jocelyn Wolff",
      "role": "Co-Owner",
      "slug": "jocelyn-wolff",
      "url": "https://www.wolffconstruction.com/jocelyn-wolff"
    },
    {
      "name": "Jared Schneider",
      "role": "Lead Project Manager",
      "slug": "jared-schneider",
      "url": "https://www.wolffconstruction.com/jared-schneider"
    },
    {
      "name": "Salina Godinez",
      "role": "Team Member — VERIFY role with client",
      "slug": "salina-godinez",
      "url": "https://www.wolffconstruction.com/salina-godinez"
    }
  ],
  "evidence": {
    "permitRecord": "19 permitted projects in three years, top 1% of 336,931 California licensed contractors per BuildZoom — VERIFY current numbers before publishing",
    "memberships": ["NARI", "NKBA"]
  },
  "sameAs": [
    "https://www.houzz.com/professionals/PLACEHOLDER-claim-rocklin-profile",
    "https://www.buildzoom.com/contractor/wolff-construction-llc-PLACEHOLDER",
    "https://www.yelp.com/biz/PLACEHOLDER",
    "https://www.facebook.com/PLACEHOLDER",
    "https://www.instagram.com/PLACEHOLDER",
    "https://www.alignable.com/PLACEHOLDER",
    "https://nextdoor.com/pages/PLACEHOLDER"
  ],
  "sameAsNote": "Replace PLACEHOLDER URLs with verified profile URLs before deploying schema. Every profile must state the Rocklin address to disambiguate from the SF Wolff Construction.",
  "positioning": {
    "model": "Low volume, high trust. Limited number of projects per year by design.",
    "minimumBudget": null,
    "minimumBudgetNote": "Confirm with client, then publish it — the filter is the differentiator",
    "notAccepted": [
      "small repairs",
      "cosmetic-only work",
      "investor flips",
      "projects without design involvement"
    ],
    "primaryCta": "preconstruction consultation"
  }
}

```

### data/questions.json

```json
{
  "note": "The AEO question set. Every answer page must lead with a direct 40-60 word answer, carry FAQPage schema, and attribute answers to a named team member. Cost cluster is highest volume, highest intent, least served — competitors publish ranges, Wolff currently publishes nothing.",
  "clusters": [
    {
      "id": "cost",
      "priority": 1,
      "questions": [
        "What does a luxury kitchen remodel cost in Granite Bay?",
        "What is the minimum budget for a whole home renovation in Placer County?",
        "What does an ADU cost per square foot in Rocklin?",
        "What is the ROI of a luxury kitchen remodel in Granite Bay?"
      ],
      "targetUrls": ["/kitchen-remodeling", "/what-is-the-cost-and-roi-of-luxury-kitchens-in-granite-bay"],
      "gap": "Publish real investment bands with real scope attached. GVD currently owns this answer at $35k-$150k+."
    },
    {
      "id": "timeline",
      "priority": 2,
      "questions": [
        "How long does a full home remodel take?",
        "Do I have to move out during a whole home renovation?",
        "How long does a kitchen remodel take in Granite Bay?"
      ],
      "targetUrls": ["/our-process", "/full-home-renovation"],
      "gap": "No timeline content exists anywhere on the site."
    },
    {
      "id": "permits",
      "priority": 3,
      "questions": [
        "What permits do I need for a remodel in Placer County?",
        "How long does Granite Bay plan check take?",
        "Who manages permits for a remodel?"
      ],
      "targetUrls": ["/our-process"],
      "gap": "Permit management is a stated capability with zero supporting content."
    },
    {
      "id": "adu",
      "priority": 4,
      "questions": [
        "Can I build an ADU in Rocklin?",
        "What are ADU setback rules in Placer County?",
        "What does an ADU cost per square foot in Rocklin?"
      ],
      "targetUrls": ["/home-additions-adu"],
      "gap": "ADU is in the homepage service tile with no page behind it."
    },
    {
      "id": "roles",
      "priority": 5,
      "questions": [
        "Do I need an architect and a general contractor?",
        "What does a designer do that a GC does not?",
        "Do I need an architect for a home addition?"
      ],
      "targetUrls": ["/our-process"],
      "gap": "Design coordination is the pitch; no page explains it."
    },
    {
      "id": "selection",
      "priority": 6,
      "questions": [
        "How do I vet a luxury contractor?",
        "What questions should I ask before signing with a remodeling contractor?",
        "How do I choose between remodeling contractors in Granite Bay?"
      ],
      "targetUrls": ["/how-to-find-the-top-luxury-home-contractors-in-granite-bay"],
      "gap": "One blog post exists; upgrade with extraction formatting and FAQPage schema."
    }
  ]
}

```

### reports/workers/gbp-audit.md

```json
(missing: reports/workers/gbp-audit.md)
```

### data/plan.json

```json
{
  "note": "The 90-day plan as trackable tasks. Statuses: done, in_progress, todo, blocked. The ops console reads and writes this file; git history is the audit trail.",
  "phases": [
    {
      "id": "phase-0",
      "name": "Pre-engagement (already delivered)",
      "days": "Day 0",
      "tasks": [
        {
          "id": "audit",
          "title": "Full site audit and competitive teardown",
          "status": "done"
        },
        {
          "id": "crawl",
          "title": "Crawl imported: 27 pages scored in data/pages.json",
          "status": "done"
        },
        {
          "id": "validator",
          "title": "seo:validate CI gate built; 35 live failures documented",
          "status": "done"
        },
        {
          "id": "payload",
          "title": "Fix payload staged for 17 defective pages",
          "status": "done"
        },
        {
          "id": "schema",
          "title": "Entity, person, service and FAQ schema generated",
          "status": "done"
        },
        {
          "id": "pipeline",
          "title": "Duda API push pipeline built (dry run tested)",
          "status": "done"
        },
        {
          "id": "intel",
          "title": "Competitor set, opportunity matrix and target site structure defined",
          "status": "done"
        }
      ]
    },
    {
      "id": "phase-1",
      "name": "Foundation",
      "days": "Days 1 to 30",
      "tasks": [
        {
          "id": "duda-access",
          "title": "Obtain Duda API credentials from account owner (Bullsai)",
          "status": "blocked"
        },
        {
          "id": "verify-facts",
          "title": "Verify NAP, license facts, team roles, review sources with client",
          "status": "todo"
        },
        {
          "id": "push-metadata",
          "title": "Push staged metadata payload (fixes /blog bug, all titles)",
          "status": "todo"
        },
        {
          "id": "push-schema",
          "title": "Deploy entity schema site-wide with CSLB identifier",
          "status": "todo"
        },
        {
          "id": "og-fix",
          "title": "Real project photo og:image + summary_large_image",
          "status": "todo"
        },
        {
          "id": "nap-contact",
          "title": "Full NAP, map and hours on contact page",
          "status": "todo"
        },
        {
          "id": "redirect-404",
          "title": "301 /construction to /our-process; blog into main nav",
          "status": "todo"
        },
        {
          "id": "houzz",
          "title": "Claim and build the Rocklin Houzz profile",
          "status": "todo"
        },
        {
          "id": "gbp",
          "title": "Rebuild Google Business Profile around target projects",
          "status": "todo"
        }
      ]
    },
    {
      "id": "phase-2",
      "name": "Customer journey",
      "days": "Days 31 to 60",
      "tasks": [
        {
          "id": "svc-kitchen",
          "title": "Launch /kitchen-remodeling service page",
          "status": "todo"
        },
        {
          "id": "svc-fullhome",
          "title": "Launch /full-home-renovation service page",
          "status": "todo"
        },
        {
          "id": "svc-adu",
          "title": "Launch /home-additions-adu service page",
          "status": "todo"
        },
        {
          "id": "projects-hub",
          "title": "Projects hub; case studies carry service and city slugs",
          "status": "todo"
        },
        {
          "id": "reviews-schema",
          "title": "Testimonials with sourced Review/AggregateRating schema",
          "status": "todo"
        },
        {
          "id": "internal-links",
          "title": "Internal links: services <-> projects <-> people <-> reviews",
          "status": "todo"
        },
        {
          "id": "cost-guide",
          "title": "First cost guide with real investment bands",
          "status": "todo"
        }
  
... (truncated, read data/plan.json for the rest)
```

## Definition of done

Files in the output contract updated, a summary report in reports/workers/gbp-auditor/, and a PR opened on a branch named worker/gbp-auditor. Findings ranked by impact with the exact fix attached to each.
