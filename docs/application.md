# Application: SEO Specialist, Wolff Construction LLC

Your posting says the goal in one sentence: **dominate local search results
and create websites that consistently produce qualified leads.** Everything
in this repository was built against that sentence before day one. This
document maps your posting, line by line, to working proof.

## Your thesis, answered

**"Dominate local search results."**
Domination in a local market is not one ranking; it is owning the whole
surface a customer sees: the local pack, the organic results, the brand
query, and now the AI answer. The system here attacks all four at once:
entity schema carrying the license number, a Google Business Profile
rebuild seeded with the questions customers actually ask, citation
consistency across every profile, service and city pages for every
commercial intent, and IndexNow plus sitemap submission so every change
reaches the engines the day it ships. The target list is not "keywords";
it is 17 specific searches with a named current owner and a play to take
each one.

**"Websites that consistently produce qualified leads."**
Qualified is the operative word, and it is enforced structurally: the
primary call to action is a preconstruction consultation, never a free
estimate; content states the minimum budget and what the business does
not take; intake records a stated budget band so lead quality is a
number, not an anecdote. The measurement model matches: the monthly
report tracks consultations above minimum budget, local pack positions,
branded search won, and AI citations. Sessions are treated as a vanity
number, in writing.

**"Multiple websites as our company grows."**
This is the part most applicants will miss and the part this system was
shaped for. Nothing here is hand built for one site. Every fact lives in
data files; pages render from templates; the validator, the console, the
AI workers, and all eight data connectors are parameterized by those
files. Onboarding contractor site number two is: clone the repository,
run the crawl import, fill in the company and city files, and the same
audit, the same fix pipeline, the same dashboards exist for that client
within a day. The per site marginal cost of this operation is low and
falls with each site, which is exactly the economics a growing
multi site operation needs.

**"Performance bonuses based on measurable SEO results."**
Welcome news, because the system cannot help but measure. Day 1 baselines
are captured before anything changes: crawl failures, positions for every
target, who the AI engines cite, Search Console impressions. Day 90 is
compared against them automatically. I am asking to be graded, and I
built the grading apparatus.

## Your responsibilities list, mapped to working code

| You asked for | Built and demonstrable |
|---|---|
| Develop and execute SEO strategies | The five layer strategy (entity, evidence, answer, retrieval, qualification) in strategy/, executed through a staged, gated pipeline |
| Keyword research and competitor analysis | 17 target searches scored by demand, fit and winnability; an 8 firm competitor file with what each owns and the counter; volumes measured via DataForSEO when connected |
| Build high quality authoritative backlinks | Partner link plan: designers, realtors, NARI, NKBA, Houzz, local press. The audit found and kills the syndicated press release spend |
| On page: titles, metas, schema, internal linking | A 17 page rewrite payload staged and validated; generated JSON-LD (business, people, services, FAQ); hub and spoke linking rules in the site plan |
| Technical: indexing, crawl errors, speed, CWV, structured data | The site check catches 27 failure classes in CI; PageSpeed connector measures LCP per template; the 404 and redirect map are staged; IndexNow handles indexing |
| Google Business Profile | A dedicated GBP Auditor worker with a monthly work order: categories, services, photos, Q&A seeded from the cost questions, review responses |
| Monitor Search Console and Analytics | Connectors built for both; GSC works today via CSV with zero setup, service account automation when access lands |
| Identify and resolve issues that impact rankings | 35 live failures found, documented, and staged for fix before this application was sent |
| Track keywords and provide monthly reports | Position tracking per target, day 1 versus day 90, reported in outcome terms: what changed, what was learned, what ships next |
| Stay current | The system itself is the answer: AEO extraction formats, GEO retrieval targets, IndexNow to the engines that feed ChatGPT and Copilot |
| Collaborate with content and dev teams | Git branch per change, adversarial review on every PR, a validator that blocks regressions from any contributor |

## Your preferred qualifications

- **Contractor and home service sites:** every artifact here is a
  contractor site artifact: permit records as the proof layer, CSLB
  license as the entity identifier, service by city architecture against
  named local competitors.
- **WordPress:** the deploy layer is adapter based. This client runs
  Duda, so the adapter speaks the Duda API; a WordPress adapter is a
  smaller job than the Duda one was, and the research includes the full
  WordPress migration architecture should a site move.
- **CRO:** conversion here is qualification. Preconstruction CTA, stated
  minimums, budget capture at intake, and the case study pages structured
  as proof rather than galleries. Fewer, better enquiries is the design
  goal, matching how a limited capacity contractor actually profits.
- **Local Service Ads and local ranking factors:** the same data spine
  feeds LSA readiness: verified license, review velocity, response
  discipline, service area definition. When a client turns LSA on, the
  profile work is already done.

## The application items

- **Examples and case studies:** this repository is the case study: a
  live audit that found 35 indexed failures on a real contractor site,
  the staged fixes, the pipeline that ships them, and the before and
  after measurement built in. Screenshots of keyword improvements follow
  from the day 1 baseline capture; I would rather show you a measured
  delta than a screenshot from someone else's campaign.
- **Tools:** Search Console, Analytics, Google Business Profile,
  PageSpeed, Screaming Frog for crawls, DataForSEO for volumes and
  SERPs, Google Trends for seasonality, embeddings for content mapping,
  IndexNow for indexing, plus the custom validator and console in this
  repository. Comfortable replacing any of them; they are tools, the
  data capture is the asset.
- **Strategy for ranking a new local business website:** capture first.
  Baseline everything before touching anything: Search Console,
  Analytics, a full crawl, the business records that prove the entity,
  and the structured data that exists about it online. Then capture the
  competitor field: who owns each commercial search, with what proof.
  Then fix the entity so every engine knows exactly who and where the
  business is; build one page per commercial intent with real proof and
  real numbers on it; make the business citable in the sources engines
  trust; and qualify hard so the leads that arrive are worth taking.
  Re capture every month; let the numbers order the work. Never publish
  a claim that does not trace to a source.
- **Rate and resume:** attached separately.
