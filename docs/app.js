'use strict';
// Fictional product illustration. No user files or tracking.
// Fetch only public release metadata to keep direct download links current.
const events = [
  { day: 22, time: '15:00', title: '联系客户确认材料', kind: '随手记下的安排' },
  { day: 23, time: '14:30', title: '星河物流｜开庭', kind: '开庭事项' },
  { day: 25, time: '09:00', title: '云杉科技｜缴费提醒', kind: '期限暂估 · 需核对' },
  { day: 28, time: '09:00', title: '远川贸易｜续封提醒', kind: '保全提醒' }
];
const grid = document.getElementById('calendar');
const agenda = document.getElementById('agenda');
const title = document.getElementById('agenda-title');
const reset = document.getElementById('all-events');
function showDay(day = null) {
  title.textContent = day ? `9 月 ${day} 日的事项` : '本月接下来的事项';
  reset.hidden = day === null;
  grid.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.day) === day)));
  const selected = day ? events.filter(e => e.day === day) : events;
  agenda.replaceChildren();
  if (!selected.length) {
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = '这一天没有示例事项。'; agenda.append(p);
  }
  selected.forEach(e => {
    const row = document.createElement('div'); row.className = 'agenda-row';
    const date = document.createElement('span'); date.className = 'agenda-date'; date.textContent = `9.${e.day}`;
    const content = document.createElement('div');
    const label = document.createElement('strong'); label.textContent = e.title;
    const meta = document.createElement('small'); meta.textContent = `${e.time} · ${e.kind}`;
    content.append(label, meta);
    const dot = document.createElement('span'); dot.className = 'row-check'; dot.textContent = '✓'; dot.setAttribute('aria-label', '示例已接收');
    row.append(date, content, dot); agenda.append(row);
  });
}
const blank = document.createElement('span'); blank.className = 'blank'; grid.append(blank);
for (let day = 1; day <= 30; day++) {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = day; b.dataset.day = day;
  const hasEvent = events.some(e => e.day === day);
  b.className = (day === 22 ? 'today ' : '') + (hasEvent ? 'has-event' : '');
  b.setAttribute('aria-label', `示例 9 月 ${day} 日${hasEvent ? '，有事项' : ''}`);
  b.addEventListener('click', () => showDay(day)); grid.append(b);
}
reset.addEventListener('click', () => showDay());
showDay();

// Keep the verified versioned DMG link usable even when the API is unavailable.
async function refreshDownloadLinks() {
  try {
    const response = await fetch('https://api.github.com/repos/susssed/pi-reminder-releases/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
      credentials: 'omit',
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return;
    const release = await response.json();
    if (release.draft || release.prerelease || !Array.isArray(release.assets)) return;
    const installer = release.assets.find(asset => /^PiReminder-.*-AppleSilicon\.dmg$/.test(asset.name));
    if (!installer) return;
    const url = new URL(installer.browser_download_url);
    if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/susssed/pi-reminder-releases/releases/download/')) return;
    document.querySelectorAll('[data-download]').forEach(link => { link.href = url.href; });
  } catch { /* Keep the static direct download when offline or rate limited. */ }
}
refreshDownloadLinks();
