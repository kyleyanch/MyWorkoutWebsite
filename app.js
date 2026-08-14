(function () {
  'use strict';

  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function num(el) {
    var v = el ? parseFloat(el.value) : NaN;
    return isFinite(v) && v > 0 ? v : 0;
  }

  function fmt(n) {
    return String(Math.round(n * 10) / 10);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function epley(weight, reps) {
    return weight * (1 + reps / 30);
  }

  function statTile(icon, value, label, hint) {
    return (
      '<wa-card class="stat-card">' +
      '<wa-icon name="' + icon + '"></wa-icon>' +
      '<div class="stat-value">' + value + '</div>' +
      '<div class="stat-label">' + label + '</div>' +
      (hint ? '<div class="stat-hint muted">' + hint + '</div>' : '') +
      '</wa-card>'
    );
  }

  /* ---------- One-rep max calculator ---------- */

  var ormBtn = $('orm-btn');
  if (ormBtn) {
    var runOrm = function () {
      var w = num($('orm-weight'));
      var r = num($('orm-reps'));
      var out = $('orm-result');
      if (!w || !r) {
        out.hidden = true;
        return;
      }
      var est = epley(w, r);
      out.innerHTML =
        'Estimated 1RM: <strong>' + fmt(est) + ' kg</strong>' +
        '<small>Based on ' + fmt(w) + ' kg for ' + fmt(r) + ' reps (Epley formula)</small>';
      out.hidden = false;
    };
    ormBtn.addEventListener('click', runOrm);
    ['orm-weight', 'orm-reps'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('wa-input', runOrm);
    });
  }

  /* ---------- Workout log ---------- */

  var LOG_KEY = 'fitlife_log';
  var getLog = function () {
    return store.get(LOG_KEY, []);
  };

  var renderLogStats = function () {
    var el = $('log-stats');
    if (!el) return;
    var items = getLog();
    var sets = items.reduce(function (s, x) { return s + x.sets; }, 0);
    var volume = items.reduce(function (s, x) { return s + x.sets * x.reps * x.weight; }, 0);
    var unique = new Set(items.map(function (x) { return x.name; })).size;
    var best = items.reduce(function (m, x) { return Math.max(m, epley(x.weight, x.reps)); }, 0);
    el.innerHTML =
      statTile('list', items.length, 'Logged sets', 'total entries') +
      statTile('arrows-up-down', fmt(volume), 'Volume (kg)', 'sets × reps × weight') +
      statTile('dumbbell', unique, 'Exercises used', 'unique movements') +
      statTile('medal', fmt(best) + ' kg', 'Best est. 1RM', 'best single lift');
  };

  var renderLog = function () {
    var list = $('log-list');
    if (!list) return;
    var items = getLog();
    if (!items.length) {
      list.innerHTML =
        '<div class="log-empty"><wa-icon name="inbox"></wa-icon>No sets logged yet. Add your first set above.</div>';
      return;
    }
    list.innerHTML = items
      .map(function (it) {
        var sets = fmt(it.sets);
        var weight = fmt(it.weight);
        var volume = fmt(it.sets * it.reps * it.weight);
        return (
          '<div class="log-item">' +
          '<div>' +
          '<div class="log-name">' + esc(it.name) + '</div>' +
          '<div class="log-meta">' + esc(it.date) + ' · ' + sets + ' × ' + fmt(it.reps) + ' reps</div>' +
          '</div>' +
          '<div class="log-spacer">' +
          '<span class="badge badge--brand">' + volume + ' kg</span>' +
          '<button class="mini-btn" data-del="' + it.id + '">Remove</button>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    list.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        store.set(LOG_KEY, getLog().filter(function (x) { return String(x.id) !== id; }));
        renderLog();
        renderLogStats();
      });
    });
  };

  var logAdd = $('log-add');
  if (logAdd) {
    logAdd.addEventListener('click', function () {
      var nameEl = $('log-exercise');
      var name = (nameEl && nameEl.value) || '';
      var sets = num($('log-sets'));
      var reps = num($('log-reps'));
      var weight = num($('log-weight'));
      var fb = $('log-feedback');
      if (!name || !sets || !reps) {
        fb.textContent = 'Pick an exercise and enter sets and reps first.';
        return;
      }
      var items = getLog();
      items.unshift({
        id: Date.now(),
        name: name,
        sets: sets,
        reps: reps,
        weight: weight,
        date: new Date().toLocaleDateString()
      });
      store.set(LOG_KEY, items);
      renderLog();
      renderLogStats();
      fb.textContent = 'Logged: ' + name + ' — ' + fmt(sets) + ' × ' + fmt(reps) + ' @ ' + fmt(weight) + ' kg.';
      ['log-sets', 'log-reps', 'log-weight'].forEach(function (id) {
        var el = $(id);
        if (el) el.value = '';
      });
    });
  }

  var logClear = $('log-clear');
  if (logClear) {
    logClear.addEventListener('click', function () {
      if (!getLog().length) return;
      if (confirm('Clear your entire workout log?')) {
        store.set(LOG_KEY, []);
        renderLog();
        renderLogStats();
      }
    });
  }

  /* ---------- Profile ---------- */

  var PROF_KEY = 'fitlife_profile';
  var defaultProfile = function () {
    return {
      name: '',
      goal: 'muscle',
      exp: 'beginner',
      days: '3',
      schedule: [true, true, true, false, true, false, false],
      progress: 0
    };
  };
  var getProfile = function () {
    return Object.assign(defaultProfile(), store.get(PROF_KEY, {}));
  };
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  var renderPills = function () {
    var wrap = $('day-pills');
    if (!wrap) return;
    var p = getProfile();
    wrap.innerHTML = '';
    DAYS.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'day-pill';
      b.setAttribute('aria-pressed', String(!!p.schedule[i]));
      b.textContent = d;
      b.addEventListener('click', function () {
        p.schedule[i] = !p.schedule[i];
        store.set(PROF_KEY, p);
        b.setAttribute('aria-pressed', String(p.schedule[i]));
      });
      wrap.appendChild(b);
    });
  };

  var loadProfile = function () {
    var p = getProfile();
    var name = $('pf-name');
    if (name) name.value = p.name;
    var goal = $('pf-goal');
    if (goal) goal.value = p.goal;
    var exp = $('pf-exp');
    if (exp) exp.value = p.exp;
    var days = $('pf-days');
    if (days) days.value = p.days;
    var range = $('goal-range');
    if (range) range.value = String(p.progress);
    var pct = $('goal-pct');
    if (pct) pct.textContent = p.progress + '%';
  };

  var saveProfile = $('pf-save');
  if (saveProfile) {
    saveProfile.addEventListener('click', function () {
      var p = getProfile();
      var name = $('pf-name');
      if (name) p.name = name.value.trim();
      var goal = $('pf-goal');
      if (goal) p.goal = goal.value;
      var exp = $('pf-exp');
      if (exp) p.exp = exp.value;
      var days = $('pf-days');
      if (days) p.days = days.value;
      store.set(PROF_KEY, p);
      var fb = $('pf-feedback');
      if (fb) fb.textContent = 'Profile saved.';
    });
  }

  var goalRange = $('goal-range');
  if (goalRange) {
    var syncProgress = function () {
      var p = getProfile();
      p.progress = parseInt(goalRange.value, 10) || 0;
      store.set(PROF_KEY, p);
      var pct = $('goal-pct');
      if (pct) pct.textContent = p.progress + '%';
    };
    goalRange.addEventListener('wa-input', syncProgress);
    goalRange.addEventListener('wa-change', syncProgress);
  }

  var renderProfileStats = function () {
    var el = $('pf-stats');
    if (!el) return;
    var p = getProfile();
    var items = getLog();
    var sets = items.reduce(function (s, x) { return s + x.sets; }, 0);
    var volume = items.reduce(function (s, x) { return s + x.sets * x.reps * x.weight; }, 0);
    var goalLabel = { muscle: 'Build muscle', strength: 'Get stronger', endurance: 'Boost endurance', general: 'Stay fit' }[p.goal] || 'Stay fit';
    el.innerHTML =
      statTile('user', esc(p.name || 'Athlete'), 'Name', goalLabel) +
      statTile('calendar-days', p.days, 'Days / week', 'training days') +
      statTile('list', sets, 'Total sets', 'from your log') +
      statTile('arrows-up-down', fmt(volume), 'Total volume (kg)', 'lifetime volume');
  };

  /* ---------- Boot ---------- */

  function boot() {
    renderLog();
    renderLogStats();
    renderProfileStats();
    renderPills();

    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      loadProfile();
      var upgraded = !!(window.customElements && customElements.get('wa-select'));
      if (upgraded || tries > 20) {
        clearInterval(timer);
        loadProfile();
      }
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
