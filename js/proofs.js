/* Proof versions + time per version (shared on the card, visible to the team) */
var KP = (function () {
  var KEY = 'proofs';
  var LIMIT = 4000;

  var STATUSES = [
    { id: 'draft',    label: 'In progress',       badge: null,     css: 'st-draft' },
    { id: 'sent',     label: 'Sent to client',    badge: 'blue',   css: 'st-sent' },
    { id: 'changes',  label: 'Changes requested', badge: 'orange', css: 'st-changes' },
    { id: 'approved', label: 'Approved',          badge: 'green',  css: 'st-approved' }
  ];
  function status(id) {
    for (var i = 0; i < STATUSES.length; i++) if (STATUSES[i].id === id) return STATUSES[i];
    return STATUSES[0];
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function uid() { return Math.random().toString(36).slice(2, 8); }

  function newVersion(d, extra) {
    var v = { id: uid(), label: 'v' + (d.versions.length + 1), status: 'draft', date: today(), file: null, notes: '', ms: 0 };
    for (var k in (extra || {})) v[k] = extra[k];
    return v;
  }

  // Reads the card data. If the card only has time from the old simple timer, it becomes v1.
  function get(t) {
    return Promise.all([
      t.get('card', 'shared', KEY, null),
      t.get('card', 'private', 'timer', null)
    ]).then(function (r) {
      var d = r[0] && Array.isArray(r[0].versions) ? r[0] : { versions: [], running: null };
      var old = r[1];
      if (!r[0] && old && (old.total > 0 || old.start)) {
        d.versions.push(newVersion(d, { ms: (old.total || 0) + (old.start ? Math.max(0, Date.now() - old.start) : 0) }));
      }
      if (d.running && !find(d, d.running.vid)) d.running = null;
      return d;
    });
  }

  function save(t, d) {
    var size = JSON.stringify(d).length;
    if (size > LIMIT) {
      return Promise.reject(new Error('This card is out of space (' + size + ' of ' + LIMIT +
        ' characters). Shorten some notes.'));
    }
    return t.set('card', 'shared', KEY, d);
  }

  function find(d, id) {
    for (var i = 0; i < d.versions.length; i++) if (d.versions[i].id === id) return d.versions[i];
    return null;
  }
  function latest(d) { return d.versions[d.versions.length - 1] || null; }

  function vTime(d, v) {
    return (v.ms || 0) + (d.running && d.running.vid === v.id ? Math.max(0, Date.now() - d.running.start) : 0);
  }
  function total(d) { return d.versions.reduce(function (a, v) { return a + vTime(d, v); }, 0); }

  function stop(d) {
    if (!d.running) return;
    var v = find(d, d.running.vid);
    if (v) v.ms = vTime(d, v);
    d.running = null;
  }

  // Start/pause always works on the latest version (creates v1 if there is none)
  function toggle(t) {
    return get(t).then(function (d) {
      if (d.running) stop(d);
      else {
        var v = latest(d);
        if (!v) { v = newVersion(d); d.versions.push(v); }
        d.running = { vid: v.id, start: Date.now() };
      }
      return save(t, d);
    });
  }

  function addTime(t, minutes) {
    return get(t).then(function (d) {
      var v = latest(d);
      if (!v) { v = newVersion(d); d.versions.push(v); }
      v.ms = Math.max(0, (v.ms || 0) + minutes * 60000);
      return save(t, d);
    });
  }

  /* ---------- Formatting ---------- */
  function fmt(ms, seconds) {
    var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    if (seconds) return h + ':' + ('0' + m).slice(-2) + ':' + ('0' + (s % 60)).slice(-2);
    if (!h) return m + 'm';
    return h + 'h ' + ('0' + m).slice(-2) + 'm';
  }
  function fmtInput(ms) {
    var mins = Math.round(ms / 60000);
    return Math.floor(mins / 60) + ':' + ('0' + (mins % 60)).slice(-2);
  }
  // Accepts 1:30, 1h 30m, 1h, 90m, 1.5h, or a plain number of minutes
  function parseDuration(str) {
    var s = String(str || '').trim().toLowerCase().replace(',', '.');
    if (!s) return 0;
    var m;
    if ((m = /^(\d+):(\d{1,2})$/.exec(s))) return (+m[1] * 60 + +m[2]) * 60000;
    if ((m = /^(?:(\d+(?:\.\d+)?)\s*h(?:rs?|ours?)?)?\s*(?:(\d+)\s*m(?:in(?:s|utes?)?)?)?$/.exec(s)) && (m[1] || m[2])) {
      return Math.round(((m[1] ? +m[1] * 60 : 0) + (m[2] ? +m[2] : 0)) * 60000);
    }
    if (/^\d+(\.\d+)?$/.test(s)) return Math.round(+s * 60000);
    return null;
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[+p[1] - 1] + ' ' + (+p[2]);
  }

  /* ---------- Small helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function safeUrl(u) {
    try { var x = new URL(String(u).trim()); return /^https?:$/.test(x.protocol) ? x.href : null; }
    catch (e) { return null; }
  }
  function applyTheme(t) {
    try { var c = t.getContext(); if (c && c.theme) document.documentElement.setAttribute('data-theme', c.theme); } catch (e) {}
  }

  function openVersion(t, id) {
    return t.modal({
      url: './version.html',
      args: id ? { id: id } : {},
      title: id ? 'Edit proof version' : 'New proof version',
      height: 640,
      accentColor: '#2457c5'
    });
  }

  return {
    STATUSES: STATUSES, status: status, get: get, save: save, find: find, latest: latest,
    newVersion: newVersion, vTime: vTime, total: total, stop: stop, toggle: toggle, addTime: addTime,
    fmt: fmt, fmtInput: fmtInput, parseDuration: parseDuration, fmtDate: fmtDate, today: today,
    esc: esc, safeUrl: safeUrl, applyTheme: applyTheme, openVersion: openVersion
  };
})();
