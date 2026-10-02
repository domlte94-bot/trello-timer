/* Timer Power-Up: play / pause on each card */
var BASE = window.location.href.replace(/[^/]*$/, '');
var CLOCK = BASE + 'img/clock.svg';

TrelloPowerUp.initialize({
  'card-buttons': function () {
    return [{ icon: CLOCK, text: 'Timer', callback: function (t) { return KT.menu(t); } }];
  },

  // Top of the open card: time spent + Start / Pause button
  'card-detail-badges': function (t) {
    return KT.get(t).then(function (s) {
      return [
        {
          dynamic: function () {
            return KT.get(t).then(function (s2) {
              return {
                title: 'Time',
                text: (s2.start ? '● ' : '') + KT.fmt(KT.elapsed(s2)),
                color: s2.start ? 'green' : null,
                refresh: 10,
                callback: function (tt) { return KT.menu(tt); }
              };
            });
          }
        },
        {
          title: 'Timer',
          text: s.start ? '⏸ Pause' : '▶ Start',
          color: s.start ? 'red' : 'blue',
          callback: function (tt) { return KT.toggle(tt); }
        }
      ];
    });
  },

  // Front of the card: time spent (green while running)
  'card-badges': function (t) {
    return KT.get(t).then(function (s) {
      if (!s.start && !s.total) return [];
      return [{
        dynamic: function () {
          return KT.get(t).then(function (s2) {
            return {
              icon: CLOCK,
              text: KT.fmt(KT.elapsed(s2)),
              color: s2.start ? 'green' : null,
              refresh: 60
            };
          });
        }
      }];
    });
  }
});
