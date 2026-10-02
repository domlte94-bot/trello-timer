/* Simple per-card timer: play / pause, saved in Trello.
   Each person has their own time on each card (private scope). */
var KT = (function () {
  var KEY = 'timer';
  var EMPTY = { total: 0, start: null };

  function get(t) {
    return t.get('card', 'private', KEY, EMPTY).then(function (s) {
      return { total: Number(s && s.total) || 0, start: (s && s.start) || null };
    });
  }
  function set(t, s) { return t.set('card', 'private', KEY, s); }

  // Time keeps counting from the start timestamp, even if Trello is closed
  function elapsed(s) { return s.total + (s.start ? Math.max(0, Date.now() - s.start) : 0); }

  function fmt(ms) {
    var mins = Math.floor(ms / 60000);
    var h = Math.floor(mins / 60), m = mins % 60;
    if (!h) return m + 'm';
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  }

  function toggle(t) {
    return get(t).then(function (s) {
      if (s.start) { s.total = elapsed(s); s.start = null; }
      else { s.start = Date.now(); }
      return set(t, s);
    });
  }

  function adjust(t, minutes) {
    return get(t).then(function (s) {
      s.total = Math.max(0, s.total + minutes * 60000);
      return set(t, s);
    });
  }

  function reset(t) { return set(t, { total: 0, start: null }); }

  function menu(t) {
    return get(t).then(function (s) {
      function act(fn) { return function (t2) { return fn(t2).then(function () { return t2.closePopup(); }); }; }
      return t.popup({
        title: 'Time on this card: ' + fmt(elapsed(s)),
        items: [
          { text: s.start ? '⏸  Pause' : '▶  Start', callback: act(toggle) },
          { text: '+ 15 min', callback: act(function (x) { return adjust(x, 15); }) },
          { text: '+ 1 hour', callback: act(function (x) { return adjust(x, 60); }) },
          { text: '− 15 min', callback: act(function (x) { return adjust(x, -15); }) },
          { text: 'Reset to 0', callback: function (t2) {
              return t2.popup({
                type: 'confirm',
                title: 'Reset time?',
                message: 'This sets your time on this card back to 0.',
                confirmText: 'Reset',
                confirmStyle: 'danger',
                onConfirm: function (t3) { return reset(t3).then(function () { return t3.closePopup(); }); },
                cancelText: 'Cancel'
              });
            } }
        ]
      });
    });
  }

  return { get: get, elapsed: elapsed, fmt: fmt, toggle: toggle, menu: menu };
})();
