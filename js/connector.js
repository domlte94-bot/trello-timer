/* Timer + Proofs Power-Up */
var BASE = window.location.href.replace(/[^/]*$/, '');
var CLOCK = BASE + 'img/clock.svg';

function timeMenu(t) {
  return KP.get(t).then(function (d) {
    var v = KP.latest(d);
    function act(fn) { return function (t2) { return fn(t2).then(function () { return t2.closePopup(); }); }; }
    return t.popup({
      title: 'Total ' + KP.fmt(KP.total(d)) + (v ? ' · adding to ' + v.label : ''),
      items: [
        { text: d.running ? '⏸  Pause' : '▶  Start', callback: act(KP.toggle) },
        { text: '+ 15 min', callback: act(function (x) { return KP.addTime(x, 15); }) },
        { text: '+ 30 min', callback: act(function (x) { return KP.addTime(x, 30); }) },
        { text: '+ 1 hour', callback: act(function (x) { return KP.addTime(x, 60); }) },
        { text: '− 15 min', callback: act(function (x) { return KP.addTime(x, -15); }) },
        { text: 'Type the time…', callback: function (t2) { return t2.closePopup().then(function () { return KP.openVersion(t2, v && v.id); }); } }
      ]
    });
  });
}

TrelloPowerUp.initialize({
  'card-back-section': function (t) {
    return {
      title: 'Proofs & time',
      icon: CLOCK,
      content: { type: 'iframe', url: t.signUrl('./section.html'), height: 160 }
    };
  },

  'card-buttons': function () {
    return [
      { icon: CLOCK, text: 'New proof version', callback: function (t) { return KP.openVersion(t); } },
      { icon: CLOCK, text: 'Timer', callback: timeMenu }
    ];
  },

  'card-detail-badges': function (t) {
    return KP.get(t).then(function (d) {
      return [
        {
          dynamic: function () {
            return KP.get(t).then(function (d2) {
              return {
                title: 'Total time',
                text: (d2.running ? '● ' : '') + KP.fmt(KP.total(d2)),
                color: d2.running ? 'green' : null,
                refresh: 10,
                callback: timeMenu
              };
            });
          }
        },
        {
          title: 'Timer',
          text: d.running ? '⏸ Pause' : '▶ Start',
          color: d.running ? 'red' : 'blue',
          callback: function (tt) { return KP.toggle(tt); }
        }
      ];
    });
  },

  'card-badges': function (t) {
    return KP.get(t).then(function (d) {
      var out = [], v = KP.latest(d);
      if (v) {
        var st = KP.status(v.status);
        out.push({ text: v.label + ' · ' + st.label, color: st.badge });
      }
      if (d.running || KP.total(d) > 0) {
        out.push({
          dynamic: function () {
            return KP.get(t).then(function (d2) {
              return { icon: CLOCK, text: KP.fmt(KP.total(d2)), color: d2.running ? 'green' : null, refresh: 60 };
            });
          }
        });
      }
      return out;
    });
  }
});
