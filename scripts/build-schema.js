#!/usr/bin/env node
'use strict';

// Generates JSON-LD payloads from data/ into schema/dist/.
// Data is the source of truth: nobody hand-edits schema, they edit data/ and rebuild.
// Usage: node scripts/build-schema.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const outDir = path.join(ROOT, 'schema', 'dist');
fs.mkdirSync(outDir, { recursive: true });

const company = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'company.json'), 'utf8'));
const cities = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services.json'), 'utf8'));
const questions = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));

const warnings = [];
if (!company.address.verified) warnings.push('company.json address is UNVERIFIED — confirm NAP with client before deploying organization schema.');
const placeholderProfiles = company.sameAs.filter((u) => u.includes('PLACEHOLDER'));
if (placeholderProfiles.length) warnings.push(`${placeholderProfiles.length} sameAs profiles are placeholders — schema emits only verified URLs.`);

const orgId = `${company.url}/#organization`;

// The entity node. The identifier carrying CSLB 1056036 is the one string the
// San Francisco Wolff Construction cannot claim.
const organization = {
  '@context': 'https://schema.org',
  '@type': ['GeneralContractor', 'LocalBusiness'],
  '@id': orgId,
  name: company.displayName,
  legalName: company.legalName,
  url: company.url,
  foundingDate: company.foundingDate,
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'CSLB License',
    value: company.license.number,
    url: company.license.verifyUrl,
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address.street,
    addressLocality: company.address.city,
    addressRegion: company.address.region,
    postalCode: company.address.postalCode,
    addressCountry: company.address.country,
  },
  areaServed: [...cities.primary, ...cities.secondary].map((c) => ({
    '@type': 'City',
    name: `${c.name}, ${c.region}`,
  })),
  founder: { '@id': `${company.url}/#${company.people[0].slug}` },
  employee: company.people.map((p) => ({ '@id': `${company.url}/#${p.slug}` })),
  memberOf: company.evidence.memberships.map((m) => ({ '@type': 'Organization', name: m })),
  sameAs: company.sameAs.filter((u) => !u.includes('PLACEHOLDER')),
  knowsAbout: services.core.map((s) => s.name),
};

const people = company.people.map((p) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${company.url}/#${p.slug}`,
  name: p.name,
  jobTitle: p.role.replace(/ — VERIFY.*$/, ''),
  url: p.url,
  worksFor: { '@id': orgId },
}));

const serviceSchemas = services.core.map((s) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${company.url}${s.plannedUrl}#service`,
  name: s.name,
  serviceType: s.name,
  provider: { '@id': orgId },
  areaServed: organization.areaServed,
  url: `${company.url}${s.plannedUrl}`,
}));

// FAQPage shells per cluster — answers get filled from approved page copy,
// never generated straight into schema.
const faqShells = questions.clusters.map((c) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${company.url}${c.targetUrls[0]}#faq`,
  mainEntity: c.questions.map((q) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: 'TODO: 40-60 word direct answer, attributed to a named team member, sourced from data/.' },
  })),
}));

function write(name, obj) {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(obj, null, 2) + '\n');
  console.log(`schema/dist/${name}`);
}

write('organization.jsonld', organization);
people.forEach((p, i) => write(`person-${company.people[i].slug}.jsonld`, p));
serviceSchemas.forEach((s, i) => write(`service-${services.core[i].id}.jsonld`, s));
faqShells.forEach((f, i) => write(`faq-${questions.clusters[i].id}.jsonld`, f));

if (warnings.length) {
  console.log('\nWARNINGS:');
  warnings.forEach((w) => console.log(`  - ${w}`));
}
