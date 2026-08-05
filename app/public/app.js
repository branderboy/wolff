'use strict';

let STATE = null;

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ------------------------------------------------------------------ tabs
document.querySelectorAll('nav button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    $('#tab-' + b.dataset.tab).classList.add('active');
  });
});

// ------------------------------------------------------------------ load
async function load() {
  STATE = await (await fetch('/api/state')).json();
  renderOverview();
  renderHistory();
  renderCompetitors();
  renderOpportunities();
  renderStructure();
  renderPages();
  renderFindings(STATE.validation);
  renderPlan();
  renderDeploy();
}

// ------------------------------------------------------------------ history
function renderHistory() {
  const pages = STATE.pages.pages || [];
  const live = pages.filter((p) => p.statusCode === 200);
  const titles = {};
  live.forEach((p) => { titles[p.title] = (titles[p.title] || 0) + 1; });
  const dupTitlePages = live.filter((p) => titles[p.title] > 1).length;
  const thin = live.filter((p) => p.wordCount > 0 && p.wordCount < 300).length;
  const geoGB = live.filter((p) => (p.title || '').includes('Granite Bay')).length;
  const geoRock = live.filter((p) => (p.title || '').includes('Rocklin')).length;
  const geoNone = live.length - live.filter((p) => /Granite Bay|Rocklin|Placer|Roseville|Folsom|Loomis|Auburn|El Dorado|Sacramento/.test(p.title || '')).length;
  const rows = [
    [dupTitlePages, 'pages share a duplicated title'],
    [thin, 'indexable pages under 300 words'],
    [pages.filter((p) => p.statusCode === 404).length, 'internally linked 404s'],
    [geoGB, 'titles carry Granite Bay (all blog posts)'],
    [geoRock, 'titles carry Rocklin (the HQ market)'],
    [geoNone, 'titles carry no geography at all'],
  ];
  $('#history').innerHTML = '<ul class="offenders">' + rows.map(([n, l]) =>
    `<li><span class="n">${n}</span>${esc(l)}</li>`).join('') + '</ul>' +
    '<p class="muted" style="margin-top:8px">The pattern: search relevance lives in blog posts aimed at one city while every money page is invisible. History says fix structure, not publish more posts.</p>';
}

// ------------------------------------------------------------------ competitors
function renderCompetitors() {
  const c = STATE.competitors;
  $('#competitor-finding').textContent = c.keyFinding || '';
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  $('#competitors-table tbody').innerHTML = (c.competitors || [])
    .slice().sort((a, b) => rank[a.threat] - rank[b.threat])
    .map((x) => `<tr>
      <td><b>${esc(x.name)}</b>${x.proof?.reviews ? `<div class="muted">${x.proof.reviews} reviews</div>` : ''}</td>
      <td><span class="badge ${x.threat === 'critical' || x.threat === 'high' ? 'fail' : x.threat === 'medium' ? 'warn' : ''}">${esc(x.threat)}</span></td>
      <td>${esc(x.model)}</td>
      <td>${(x.owns || []).map(esc).join('<br>')}</td>
      <td class="muted">${esc(x.wolffAngle || '')}</td>
    </tr>`).join('');
}

// ------------------------------------------------------------------ opportunities
function renderOpportunities() {
  const opps = (STATE.opportunities.opportunities || []).slice().sort((a, b) => b.score - a.score);
  $('#opps-table tbody').innerHTML = opps.map((o) => `<tr>
    <td><b class="score">${o.score}</b></td>
    <td><span class="badge staged">${esc(o.intent)}</span></td>
    <td>${esc(o.query)}</td>
    <td class="muted">${esc(o.ownedBy)}</td>
    <td class="muted">${esc(o.wolffToday)}</td>
    <td>${esc(o.play)}</td>
    <td class="path">${esc(o.targetUrl)}</td>
  </tr>`).join('');
}

// ------------------------------------------------------------------ structure
function renderStructure() {
  const s = STATE.structure;
  $('#linking-rules').innerHTML = (s.linkingRules || []).map((r) => `<li>${esc(r)}</li>`).join('');
  function node(n, depth) {
    const kids = (n.children || []).map((c) => node(c, depth + 1)).join('');
    const extras = [
      n.proof?.length ? `${n.proof.length} proof projects` : '',
      n.spokes?.length ? `${n.spokes.length} blog spokes` : '',
    ].filter(Boolean).join(' · ');
    return `<div class="tnode" style="margin-left:${depth * 18}px">
      <i class="lg ${esc(n.status)}"></i>
      <code>${esc(n.url)}</code>
      <span class="muted">${esc(n.role)}${extras ? ' · ' + extras : ''}</span>
    </div>` + kids;
  }
  $('#tree').innerHTML = (s.tree || []).map((n) => node(n, 0)).join('');
}

function counts() {
  const v = STATE.validation;
  return {
    pages: STATE.pages.pages?.length ?? 0,
    fails: v?.failCount ?? null,
    warns: v?.warnCount ?? null,
    staged: STATE.updates.pages?.length ?? 0,
  };
}

// ------------------------------------------------------------------ overview
function renderOverview() {
  const c = counts();
  const allTasks = STATE.plan.phases.flatMap((p) => p.tasks);
  const donePct = Math.round((allTasks.filter((t) => t.status === 'done').length / allTasks.length) * 100);

  $('#stats').innerHTML = [
    [c.pages, 'pages in last crawl', false],
    [c.fails ?? '·', 'validator failures', (c.fails ?? 0) > 0],
    [c.warns ?? '·', 'warnings', false],
    [c.staged, 'staged page fixes', false],
    [donePct + '%', 'plan complete', false],
  ].map(([n, l, bad]) => `<div class="stat"><b class="${bad ? 'bad' : ''}">${n}</b><span>${l}</span></div>`).join('');

  const dot = $('#health-dot'), txt = $('#health-text');
  if (c.fails === null) { dot.className = 'dot'; txt.textContent = 'validator not run yet'; }
  else if (c.fails > 0) { dot.className = 'dot bad'; txt.textContent = `${c.fails} failures live`; }
  else { dot.className = 'dot ok'; txt.textContent = 'gate passing'; }

  const v = STATE.validation;
  if (v?.findings?.length) {
    const perUrl = {};
    for (const f of v.findings.filter((f) => f.severity === 'FAIL')) {
      const u = f.url.split('\n')[0].replace('https://www.wolffconstruction.com', '') || '/';
      perUrl[u] = (perUrl[u] || 0) + 1;
    }
    const top = Object.entries(perUrl).sort((a, b) => b[1] - a[1]).slice(0, 6);
    $('#offenders').innerHTML = top.map(([u, n]) => `<li><span class="n">${n}</span>${esc(u)}</li>`).join('');
  }
}

// ------------------------------------------------------------------ pages
function renderPages() {
  const staged = new Map((STATE.updates.pages || []).map((u) => [u.path, u]));
  const rows = (STATE.pages.pages || []).map((p) => {
    const s = staged.get(p.path);
    const status = p.statusCode === 404
      ? '<span class="badge fail">404</span>'
      : s ? '<span class="badge staged">fix staged</span>' : '<span class="badge">ok as-is</span>';
    const title = s
      ? `<div class="old">${esc(p.title || '(none)')}</div><div class="new">${esc(s.title)}</div>`
      : esc(p.title || '(none)');
    return `<tr><td class="path" title="${esc(p.path)}">${esc(p.path)}</td><td>${esc(p.title || '(none)')}</td><td>${s ? `<span class="new">${esc(s.title)}</span>` : '<span class="muted">·</span>'}</td><td>${p.wordCount || 0}</td><td>${status}</td></tr>`;
  });
  $('#pages-table tbody').innerHTML = rows.join('');
  $('#pages-count').textContent = `· ${rows.length} URLs`;
}

// ------------------------------------------------------------------ validator
function renderFindings(v) {
  if (!v) { $('#findings').innerHTML = '<p class="muted">No results yet. Run the validator.</p>'; return; }
  $('#validate-meta').textContent = `Last run ${new Date(v.generatedAt).toLocaleString()} · mode: ${v.mode} · ${v.failCount} FAIL, ${v.warnCount} WARN across ${v.pageCount} pages`;
  const byCheck = {};
  for (const f of v.findings) (byCheck[f.check] ||= []).push(f);
  $('#findings').innerHTML = Object.entries(byCheck)
    .sort((a, b) => (a[1][0].severity === 'FAIL' ? -1 : 1) - (b[1][0].severity === 'FAIL' ? -1 : 1))
    .map(([check, items]) => `
      <div class="group">
        <h3><span class="badge ${items[0].severity === 'FAIL' ? 'fail' : 'warn'}">${items[0].severity}</span> ${esc(check)} <span class="muted">· ${items.length}</span></h3>
        ${items.map((f) => `<div class="item"><div class="url">${esc(f.url.split('\n')[0])}</div>${esc(f.detail)}</div>`).join('')}
      </div>`).join('');
}

$('#run-validate').addEventListener('click', async () => {
  $('#run-validate').disabled = true; $('#run-validate').textContent = 'Running…';
  const r = await (await fetch('/api/run/validate', { method: 'POST' })).json();
  STATE.validation = r.validation;
  renderFindings(r.validation); renderOverview();
  $('#run-validate').disabled = false; $('#run-validate').textContent = 'Run validator';
});

// ------------------------------------------------------------------ plan
const CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo', blocked: 'todo' };
function renderPlan() {
  $('#phases').innerHTML = STATE.plan.phases.map((ph) => {
    const done = ph.tasks.filter((t) => t.status === 'done').length;
    const pct = Math.round((done / ph.tasks.length) * 100);
    return `<div class="phase">
      <div class="days">${esc(ph.days)}</div>
      <h3>${esc(ph.name)}</h3>
      <div class="progress"><i style="width:${pct}%"></i></div>
      ${ph.tasks.map((t) => `<div class="task ${t.status}" data-id="${t.id}"><span class="st"></span><span>${esc(t.title)}</span></div>`).join('')}
    </div>`;
  }).join('');
  document.querySelectorAll('.task').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const task = STATE.plan.phases.flatMap((p) => p.tasks).find((t) => t.id === id);
      const r = await (await fetch('/api/plan/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, status: CYCLE[task.status] || 'todo' }),
      })).json();
      if (r.ok) { STATE.plan = r.plan; renderPlan(); renderOverview(); }
    });
  });
}

// ------------------------------------------------------------------ deploy
function renderDeploy() {
  const b = $('#duda-badge');
  if (STATE.dudaReady) { b.textContent = 'credentials present'; b.className = 'badge ok'; }
  else { b.textContent = 'credentials missing, Apply disabled'; b.className = 'badge fail'; }
  armApply();
}
function armApply() {
  $('#run-apply').disabled = !(STATE.dudaReady && $('#confirm-input').value === 'PUSH TO WOLFF');
}
$('#confirm-input').addEventListener('input', armApply);

function out(text) { $('#console-out').textContent = text || '(no output)'; }
async function runTo(endpoint, bodyObj) {
  out('Running…');
  const r = await (await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyObj ? JSON.stringify(bodyObj) : undefined,
  })).json();
  out((r.stdout || '') + (r.stderr ? '\n--- stderr ---\n' + r.stderr : '') + (r.error ? '\nERROR: ' + r.error : ''));
  return r;
}
$('#run-diff').addEventListener('click', () => runTo('/api/duda/diff'));
$('#run-schema').addEventListener('click', () => runTo('/api/run/schema'));
$('#run-apply').addEventListener('click', async () => {
  await runTo('/api/duda/apply', { confirm: $('#confirm-input').value });
  $('#confirm-input').value = ''; armApply();
});

load();
