/* Add / edit one proof version */
var t = TrelloPowerUp.iframe();
KP.applyTheme(t);
var $ = function (id) { return document.getElementById(id); };
var vid = t.arg('id') || null;
var data, v, statusId = 'draft';

function showError(m) { $('error').textContent = m; $('error').hidden = !m; }

function buildStatuses() {
  $('statuses').innerHTML = KP.STATUSES.map(function (s) {
    var on = s.id === statusId;
    return '<button type="button" role="radio" aria-checked="' + on + '" class="seg-btn ' + s.css + (on ? ' on' : '') +
      '" data-st="' + s.id + '">' + KP.esc(s.label) + '</button>';
  }).join('');
}

$('statuses').addEventListener('click', function (e) {
  var b = e.target.closest('[data-st]');
  if (b) { statusId = b.getAttribute('data-st'); buildStatuses(); }
});

document.querySelectorAll('[data-add]').forEach(function (b) {
  b.addEventListener('click', function () {
    var cur = KP.parseDuration($('time').value) || 0;
    $('time').value = KP.fmtInput(cur + Number(b.getAttribute('data-add')) * 60000);
  });
});

// Attachments of this card
$('pickFile').addEventListener('click', function () {
  var box = $('filePicker');
  if (!box.hidden) { box.hidden = true; return; }
  t.card('attachments').then(function (c) {
    var atts = (c.attachments || []).filter(function (a) { return KP.safeUrl(a.url); });
    box.innerHTML = atts.length
      ? atts.slice().reverse().map(function (a, i) {
          return '<button type="button" class="file-opt as-btn" data-i="' + i + '">' + KP.esc(a.name || a.url) + '</button>';
        }).join('')
      : '<p class="hint">This card has no attachments yet.</p>';
    box.hidden = false;
    box.onclick = function (e) {
      var b = e.target.closest('[data-i]');
      if (!b) return;
      var a = atts.slice().reverse()[Number(b.getAttribute('data-i'))];
      $('fileUrl').value = a.url;
      if (!$('fileLabel').value.trim()) $('fileLabel').value = String(a.name || 'Proof').replace(/\.[a-z0-9]{2,5}$/i, '');
      box.hidden = true;
    };
  });
});

$('cancelBtn').addEventListener('click', function () { t.closeModal(); });

var confirmDel = false;
$('deleteBtn').addEventListener('click', function () {
  if (!confirmDel) { confirmDel = true; this.textContent = 'Click again to delete'; return; }
  if (data.running && data.running.vid === v.id) data.running = null;
  data.versions = data.versions.filter(function (x) { return x.id !== v.id; });
  KP.save(t, data).then(function () { t.closeModal(); }, function (e) { showError(e.message); });
});

$('form').addEventListener('submit', function (e) {
  e.preventDefault();
  var label = $('label').value.trim();
  if (!label) { showError('Give the version a name, like v2.'); return; }
  var ms = KP.parseDuration($('time').value);
  if (ms === null) { showError('The time isn’t clear. Use 1:30, 1h 30m, 90m or 1.5h.'); $('time').focus(); return; }
  var fileUrl = $('fileUrl').value.trim();
  if (fileUrl && !KP.safeUrl(fileUrl)) { showError('The file link must start with https://'); return; }

  var isNew = !v;
  if (isNew) {
    KP.stop(data);                       // new version: pause the timer on the previous one
    v = KP.newVersion(data);
    data.versions.push(v);
  }
  v.label = label;
  v.date = $('date').value || '';
  v.status = statusId;
  v.notes = $('notes').value.trim();
  v.file = fileUrl ? { label: $('fileLabel').value.trim() || 'Proof file', url: KP.safeUrl(fileUrl) } : null;
  v.ms = ms;
  if (data.running && data.running.vid === v.id) data.running.start = Date.now(); // keep counting from the typed time

  KP.save(t, data).then(function () { t.closeModal(); }, function (err) {
    if (isNew) data.versions.pop();
    showError(err.message);
  });
});

KP.get(t).then(function (d) {
  data = d;
  v = vid ? KP.find(d, vid) : null;
  var draft = v || KP.newVersion(d);
  statusId = draft.status;
  $('label').value = draft.label;
  $('date').value = draft.date || '';
  $('time').value = KP.fmtInput(v ? KP.vTime(d, v) : 0);
  $('notes').value = draft.notes || '';
  if (draft.file) { $('fileLabel').value = draft.file.label || ''; $('fileUrl').value = draft.file.url || ''; }
  $('deleteBtn').hidden = !v;
  $('runningNote').hidden = !(v && d.running && d.running.vid === v.id);
  buildStatuses();
  $('label').focus();
});
