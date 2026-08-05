# SEO Validation Report — wolffconstruction.com

Mode: crawl CSV | Pages: 27 | **35 failures**, 29 warnings

This is the output of the CI gate (`npm run seo:validate`) run against the current site.
Every failure below shipped to production and was indexed. The gate blocks merges that reintroduce any of them.

## Failures (block the build)

### `title-too-short` — 10

- https://www.wolffconstruction.com/
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/silk-and-sage
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/cream-and-cashmere
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/the-team
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/privacy
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/sculpted-slate
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/jared-schneider
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/jocelyn-wolff
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/don-erik-wolff
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.
- https://www.wolffconstruction.com/salina-godinez
  - Title is 18 chars (min 25): "Wolff Construction". A bare brand title concedes the SERP — and the brand fight with the SF Wolff Construction.

### `title-no-geo` — 12

- https://www.wolffconstruction.com/
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/silk-and-sage
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/cream-and-cashmere
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/the-team
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/sculpted-slate
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/testimonials
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction Testimonials"
- https://www.wolffconstruction.com/what-should-i-look-for-in-a-luxury-bathroom-contractor-in-granite-bay-ca
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "What Should I Look for in a Luxury Bathroom Contractor?"
- https://www.wolffconstruction.com/who-is-the-top-rated-luxury-kitchen-bathroom-remodel-team-granite-bay
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Who Is the Top Rated Luxury Kitchen Remodel Team Near Me?"
- https://www.wolffconstruction.com/jared-schneider
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/jocelyn-wolff
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/don-erik-wolff
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"
- https://www.wolffconstruction.com/salina-godinez
  - Title carries no geo token (Rocklin, Granite Bay, Roseville, Loomis, ...): "Wolff Construction"

### `h1-multiple` — 1

- https://www.wolffconstruction.com/
  - More than one H1: "WOLFF CONSTRUCTION" / "Built with Integrity"

### `content-critically-thin` — 3

- https://www.wolffconstruction.com/silk-and-sage
  - 85 words. A project page under 90 words cannot rank or be cited for anything.
- https://www.wolffconstruction.com/cream-and-cashmere
  - 87 words. A project page under 90 words cannot rank or be cited for anything.
- https://www.wolffconstruction.com/sculpted-slate
  - 77 words. A project page under 90 words cannot rank or be cited for anything.

### `h1-missing` — 1

- https://www.wolffconstruction.com/privacy
  - Page has no H1.

### `title-too-long` — 1

- https://www.wolffconstruction.com/creating-your-living-masterpiece-a-guide-to-a-bathroom-remodel-and-luxury-kitchen-remodel-in-granite-bay-ca
  - Title is 109 chars (max 65): "Creating Your Living Masterpiece: A Guide to a Bathroom Remodel and Luxury Kitchen Remodel in Granite Bay, CA"

### `http-404` — 1

- https://www.wolffconstruction.com/construction
  - Returns 404 with 2 internal inlinks. Fix the link or redirect the URL.

### `title-duplicate` — 3

- https://www.wolffconstruction.com/
  - 10 pages share the title "Wolff Construction".
- https://www.wolffconstruction.com/contact
  - 2 pages share the title "Wolff Construction | Rocklin Contractor".
- https://www.wolffconstruction.com/careers
  - 2 pages share the title "Join Wolff Construction Team".

### `description-duplicate` — 2

- https://www.wolffconstruction.com/
  - 11 pages share the same meta description ("Wolff Construction is a trusted, 5-star rated builder known for qualit...").
- https://www.wolffconstruction.com/careers
  - 2 pages share the same meta description ("Empower your career with Wolff Construction. Submit your info & resume...").

### `template-bleed` — 1

- https://www.wolffconstruction.com/blog
  - Non-careers page carries careers metadata: "Join Wolff Construction Team". This is the live /blog bug.

## Warnings

### `meta-keywords-present` — 26

- https://www.wolffconstruction.com/
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/contact
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/our-process
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/careers
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/silk-and-sage
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/cream-and-cashmere
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/the-team
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/privacy
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/blog
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/sculpted-slate
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/testimonials
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/what-does-a-luxury-kitchen-remodel-look-like-in-granite-bay
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/what-should-i-look-for-in-a-luxury-bathroom-contractor-in-granite-bay-ca
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/what-does-a-luxury-home-remodel-actually-include-in-granite-bay-ca
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/how-to-find-the-top-luxury-home-contractors-in-granite-bay
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/luxury-bathroom-remodel-granite-bay-ca
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/creating-your-living-masterpiece-a-guide-to-a-bathroom-remodel-and-luxury-kitchen-remodel-in-granite-bay-ca
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/who-is-the-top-rated-luxury-kitchen-bathroom-remodel-team-granite-bay
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/what-does-a-luxury-home-contractor-consider-before-a-project-in-granite-bay
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/jared-schneider
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/jocelyn-wolff
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/don-erik-wolff
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/salina-godinez
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/a-luxury-home-remodel-built-for-the-next-20-years-in-granite-bay-ca
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/what-is-the-cost-and-roi-of-luxury-kitchens-in-granite-bay
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.
- https://www.wolffconstruction.com/luxury-home-remodel-in-granite-bay-ca-turning-vision-into-timeless-design
  - Meta keywords tag present ("Wolff Construction"). Dead since 2009. Remove it.

### `description-too-long` — 1

- https://www.wolffconstruction.com/what-does-a-luxury-home-remodel-actually-include-in-granite-bay-ca
  - Description is 174 chars (max 160).

### `content-thin` — 2

- https://www.wolffconstruction.com/jared-schneider
  - 243 words (target 300+ for indexable marketing pages).
- https://www.wolffconstruction.com/salina-godinez
  - 253 words (target 300+ for indexable marketing pages).

