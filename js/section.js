/* "Proofs & time" section inside the card */
var t = TrelloPowerUp.iframe();
var app = document.getElementById('app');
var data = { versions: [], running: null };
KP.applyTheme(t);

var ICON_EDIT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5 13.5 5 6 12.5H3.5V10z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
var ICON_FILE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.5 8.5h5M5.5 11h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

function pill(st) { return '<span class="pill ' + st.css + '">' + KP.esc(st.label) + '</span>'; }

function row(v) {
  var st = KP.status(v.status);
  var isRunning = data.running && data.running.vid === v.id;
  var file = v.file && KP.safeUrl(v.file.url)
    ? '<a class="file-link" href="' + KP.esc(v.file.url) + '" target="_blank" rel="noopener noreferrer">' + ICON_FILE +
      '<span>' + KP.esc(v.file.label || 'Proof file') + '</span></a>'
    : '';
  return '<li class="ver' + (isRunning ? ' running' : '') + '">' +
    '<div class="ver-main">' +
      '<span class="ver-label">' + KP.esc(v.label) + '</span>' + pill(st) +
      (v.date ? '<span class="ver-date">' + KP.fmtDate(v.date) + '</span>' : '') +
      '<span class="spacer"></span>' +
      '<span class="ver-time" data-vid="' + v.id + '">' + (isRunning ? '● ' : '') + KP.fmt(KP.vTime(data, v), isRunning) + '</span>' +
      '<button class="icon-btn" data-edit="' + v.id + '" aria-label="Edit ' + KP.esc(v.label) + '">' + ICON_EDIT + '</button>' +
    '</div>' +
    (file || v.notes ? '<div class="ver-extra">' + file + (v.notes ? '<p class="ver-notes">' + KP.esc(v.notes) + '</p>' : '') + '</div>' : '') +
  '</li>';
}

function render() {
  var v = KP.latest(data);
  var running = !!data.running;
  var st = v ? KP.status(v.status) : null;
  app.innerHTML =
    '<div class="summary' + (running ? ' is-running' : '') + '">' +
      '<div class="sum-total"><span class="sum-label">Total time</span>' +
        '<span class="sum-value" id="total">' + KP.fmt(KP.total(data), running) + '</span></div>' +
      '<div class="sum-status">' + (v ? '<span class="sum-label">Current</span><span>' +
        '<strong>' + KP.esc(v.label) + '</strong> ' + pill(st) + '</span>' : '<span class="sum-label">No proofs yet</span>') + '</div>' +
      '<span class="spacer"></span>' +
      '<button class="btn ' + (running ? 'danger-solid' : 'primary') + ' big" data-toggle>' +
        (running ? '⏸ Pause' : '▶ Start' + (v ? ' ' + KP.esc(v.label) : '')) + '</button>' +
    '</div>' +
    (data.versions.length
      ? '<ul class="versions">' + data.versions.slice().reverse().map(row).join('') + '</ul>'
      : '<p class="muted pad">Start the timer, or add the first proof version.</p>') +
    '<button class="btn ghost add-more" data-new>+ New version</button>';
}

// Live clock while running
setInterval(function () {
  if (!data.running) return;
  var el = document.getElementById('total');
  if (el) el.textContent = KP.fmt(KP.total(data), true);
  var v = KP.find(data, data.running.vid);
  var cell = v && app.querySelector('[data-vid="' + v.id + '"]');
  if (cell) cell.textContent = '● ' + KP.fmt(KP.vTime(data, v), true);
}, 1000);

app.addEventListener('click', function (e) {
  if (e.target.closest('[data-toggle]')) { KP.toggle(t); return; }
  var ed = e.target.closest('[data-edit]');
  if (ed) { KP.openVersion(t, ed.getAttribute('data-edit')); return; }
  if (e.target.closest('[data-new]')) KP.openVersion(t);
});

t.render(function () {
  return KP.get(t).then(function (d) { data = d; render(); return t.sizeTo('#app'); });
});
window.addEventListener('resize', function () { t.sizeTo('#app'); });
