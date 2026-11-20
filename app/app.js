// Leonida Trophy Guide: an offline checklist and tracker for GTA VI's 55 PS5 trophies.
// Progress lives in localStorage, exports to a file, and imports back. Filters cover kind
// (story, missable, collectibles, activities, strangers, crime, exploration, money, online),
// grade, earned state and search; the spoiler setting hides un-earned story trophies.
// Deep links: ?kind= ?grade= ?show= ?search= ?spoiler=on ?open=<id> ?view=roadmap|missable
// and ?earned=1,2,3 (a share link that opens with those trophies ticked).
const STORAGE_KEY = 'gta6-trophy-checklist';
const rowsEl = document.getElementById('rows');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const showEl = document.getElementById('show');
const spoilerEl = document.getElementById('spoiler');

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

function readStoredProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.map((v) => (typeof v === 'number' ? v : byName.get(v)?.id)).filter((id) => byId.has(id)));
  } catch {
    return new Set();
  }
}

let earned = readStoredProgress();
const shared = params.get('earned');
if (shared) {
  const ids = shared.split(',').map((s) => Number(s.trim())).filter((id) => byId.has(id));
  if (ids.length) earned = new Set(ids);
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeCounts() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of earned) counts[byId.get(id).grade] += 1;
  return counts;
}

function renderProgress() {
  const counts = gradeCounts();
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(earned.size));
  document.getElementById('progressDetail').textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
  document.getElementById('platinumNote').textContent = earned.has(1)
    ? 'Platinum earned — you are a Leonida Legend.'
    : earned.size === trophies.length - 1
      ? 'One trophy left, then the platinum pops.'
      : `Earn the other ${trophies.length - earned.size} to unlock the platinum.`;
}

function sourceLinks(trophy) {
  const links = [];
  for (const name of trophy.sources ?? []) {
    const url = doc.sourceLinks?.[name];
    if (url) links.push({ name, url });
  }
  return links;
}

function trophyCard(trophy) {
  const isEarned = earned.has(trophy.id);
  const spoilerHidden = spoilerEl.checked && trophy.kind === 'story' && !isEarned;
  const card = document.createElement('article');
  card.className = `card grade-${trophy.grade}${isEarned ? ' earned' : ''}${trophy.missable ? ' missable' : ''}`;
  card.dataset.id = String(trophy.id);

  const label = document.createElement('label');
  label.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveProgress();
    renderProgress();
    renderRoadmap();
    const scrollY = window.scrollY;
    renderList();
    window.scrollTo(0, scrollY);
  });
  label.append(box, document.createElement('span'));

  const body = document.createElement('div');
  body.className = 'card-body';
  const head = document.createElement('div');
  head.className = 'card-head';
  const badge = document.createElement('span');
  badge.className = `badge badge-${trophy.grade}`;
  badge.textContent = trophy.grade;
  const title = document.createElement('h3');
  title.textContent = spoilerHidden ? 'Hidden story trophy' : trophy.name;
  head.append(badge, title);
  body.append(head);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = spoilerHidden
    ? 'Hidden until earned — turn the spoiler setting off, or earn this story trophy, to reveal it.'
    : trophy.description;
  body.append(desc);

  const tags = document.createElement('p');
  tags.className = 'tags';
  const tagTexts = [];
  if (trophy.hidden) tagTexts.push('Hidden on PS5');
  tagTexts.push(trophy.kind);
  if (trophy.count) tagTexts.push(`Count: ${trophy.count}`);
  if (trophy.missable) tagTexts.push('⚠ Missable');
  if (trophy.timeSensitive) tagTexts.push('⏳ Finish during the story');
  if (isEarned) tagTexts.push('✓ Earned');
  tags.textContent = tagTexts.join(' · ');
  body.append(tags);

  if (!spoilerHidden) {
    const details = document.createElement('details');
    if (params.get('open') === String(trophy.id)) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Guide';
    details.append(summary);
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    details.append(guide);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    sourceLinks(trophy).forEach((link, i) => {
      if (i) sources.append(document.createTextNode(', '));
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.name;
      a.target = '_blank';
      a.rel = 'noopener';
      sources.append(a);
    });
    details.append(sources);
    body.append(details);
  }
  card.append(label, body);
  return card;
}

function trophyMatches(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(trophy.name.toLowerCase().includes(q) || trophy.description.toLowerCase().includes(q) || trophy.guide.toLowerCase().includes(q))) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (kindEl.value === 'missable' && !trophy.missable) return false;
  if (kindEl.value === 'online') return false;
  if (kindEl.value !== 'all' && kindEl.value !== 'missable' && trophy.kind !== kindEl.value) return false;
  if (showEl.value === 'earned' && !earned.has(trophy.id)) return false;
  if (showEl.value === 'unearned' && earned.has(trophy.id)) return false;
  return true;
}

function renderList() {
  rowsEl.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!trophyMatches(trophy)) continue;
    rowsEl.append(trophyCard(trophy));
    shown += 1;
  }
  document.getElementById('countLine').textContent = `Showing ${shown} of ${trophies.length} trophies · ${earned.size} earned`;
  document.getElementById('emptyNote').hidden = shown !== 0;
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const stage of roadmapDoc.stages) {
    const li = document.createElement('li');
    const done = stage.ids.filter((id) => earned.has(id)).length;
    const h3 = document.createElement('h3');
    h3.textContent = `${stage.title} — ${done}/${stage.ids.length}`;
    const p = document.createElement('p');
    p.textContent = stage.summary;
    const goal = document.createElement('p');
    goal.className = 'stage-goal';
    goal.textContent = stage.goal;
    li.append(h3, p, goal);
    list.append(li);
  }
}

function renderMissable() {
  const box = document.getElementById('missableList');
  box.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  const windows = trophies.filter((t) => t.timeSensitive);
  for (const trophy of missable) {
    const p = document.createElement('p');
    p.className = 'missable-item';
    const strong = document.createElement('strong');
    strong.textContent = `⚠ ${trophy.name} — ${trophy.description} `;
    const span = document.createElement('span');
    span.textContent = 'Meditate at Jason\u2019s house while Chapter 1 is still running; GTABase and PowerPyx flag this as the only possibly missable trophy (via EGamers), and GTAScoop names the Chapter 1 house spot.';
    p.append(strong, span);
    box.append(p);
  }
  const p2 = document.createElement('p');
  p2.className = 'missable-item';
  const strong2 = document.createElement('strong');
  strong2.textContent = '⏳ Story windows — ';
  const span2 = document.createElement('span');
  span2.textContent = `${windows.map((t) => t.name).join(', ')}: TechWiser (via EGamers) reports that stranger mission strands have windows tied to story progress, so finish these strands during the story rather than leaving them for after it.`;
  p2.append(strong2, span2);
  box.append(p2);
  document.getElementById('missableNote').textContent =
    'Everything else is safe: the 12 story trophies unlock automatically, one playthrough is enough, and free roam continues after the final mission (PushSquare).';
}

function exportProgress() {
  const payload = { game: 'Grand Theft Auto VI', platform: 'PlayStation 5', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const raw = JSON.parse(await file.text());
  const list = Array.isArray(raw) ? raw : raw.earned;
  if (!Array.isArray(list)) throw new Error('not a progress file');
  const ids = list.map((v) => (typeof v === 'number' ? v : byName.get(v)?.id)).filter((id) => byId.has(id));
  earned = new Set(ids);
  saveProgress();
  renderProgress();
  renderRoadmap();
  renderList();
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await importProgress(file);
    document.getElementById('savedNote').textContent = `Imported ${earned.size} earned trophies from ${file.name}.`;
  } catch {
    document.getElementById('savedNote').textContent = 'That file is not a trophy progress export.';
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderProgress();
  renderRoadmap();
  renderList();
});
for (const el of [searchEl, kindEl, gradeEl, showEl, spoilerEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}

if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('show')) showEl.value = params.get('show');
if (params.get('search')) searchEl.value = params.get('search');
if (params.get('spoiler') === 'on') spoilerEl.checked = true;

saveProgress();
renderProgress();
renderRoadmap();
renderMissable();
renderList();
if (params.get('view') === 'roadmap') document.getElementById('roadmapPanel').scrollIntoView();
if (params.get('view') === 'missable') document.getElementById('missablePanel').scrollIntoView();
if (params.get('view') === 'tracker') document.getElementById('trackerPanel').scrollIntoView();
else if (params.get('open')) document.querySelector(`.card[data-id="${params.get('open')}"]`)?.scrollIntoView({ block: 'center' });
