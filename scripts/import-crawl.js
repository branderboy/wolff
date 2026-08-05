#!/usr/bin/env node
'use strict';

// Imports a Screaming Frog "Internal HTML" export into data/pages.json.
// Usage: node scripts/import-crawl.js [path/to/crawl.csv]

const fs = require('fs');
const path = require('path');
const { parseCsv } = require('./lib/csv');

const csvPath = process.argv[2] || path.join(__dirname, '..', 'research', 'resentialcontruction.csv');
const outPath = path.join(__dirname, '..', 'data', 'pages.json');

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));

const pages = rows.map((r) => ({
  url: r['Address'],
  path: new URL(r['Address']).pathname,
  statusCode: Number(r['Status Code']) || 0,
  indexability: r['Indexability'],
  title: r['Title 1'] || '',
  titleLength: Number(r['Title 1 Length']) || 0,
  metaDescription: r['Meta Description 1'] || '',
  metaDescriptionLength: Number(r['Meta Description 1 Length']) || 0,
  metaKeywords: r['Meta Keywords 1'] || '',
  h1: r['H1-1'] || '',
  h1Second: r['H1-2'] || '',
  canonical: r['Canonical Link Element 1'] || '',
  wordCount: Number(r['Word Count']) || 0,
  crawlDepth: Number(r['Crawl Depth']) || 0,
  inlinks: Number(r['Unique Inlinks']) || 0,
}));

fs.writeFileSync(outPath, JSON.stringify({ source: path.basename(csvPath), importedPages: pages.length, pages }, null, 2) + '\n');
console.log(`Imported ${pages.length} pages from ${csvPath} -> ${outPath}`);
