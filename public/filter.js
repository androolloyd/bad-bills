/* Generic client-side filter for server-rendered .tracker-grid cards (Astro). */
(function () {
  function gridById(id) { return document.getElementById(id); }
  function apply(g) {
    var q = (g.dataset.q || '').toLowerCase(), f = g._f || {}, shown = 0;
    var cards = g.querySelectorAll('.card');
    cards.forEach(function (c) {
      var ok = true;
      ['risk', 'status', 'jur'].forEach(function (k) { var v = f[k]; if (v && v !== 'all' && (c.dataset[k] || '') !== v) ok = false; });
      if (ok && q && (c.dataset.text || '').indexOf(q) < 0) ok = false;
      c.style.display = ok ? '' : 'none'; if (ok) shown++;
    });
    var cnt = document.querySelector('[data-count="' + g.id + '"]');
    if (cnt) cnt.textContent = shown + ' of ' + cards.length + ' bills shown';
  }
  document.querySelectorAll('.tracker-grid[id]').forEach(function (g) { g._f = {}; });
  document.querySelectorAll('[data-search]').forEach(function (inp) {
    var g = gridById(inp.getAttribute('data-search')); if (!g) return;
    inp.addEventListener('input', function () { g.dataset.q = inp.value; apply(g); });
  });
  document.querySelectorAll('[data-chips]').forEach(function (grp) {
    var p = grp.getAttribute('data-chips').split(':'), g = gridById(p[0]), attr = p[1]; if (!g) return;
    grp.querySelectorAll('.chip').forEach(function (ch) {
      ch.addEventListener('click', function () {
        grp.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
        ch.classList.add('active'); g._f[attr] = ch.dataset.val; apply(g);
      });
    });
  });
  document.querySelectorAll('[data-select]').forEach(function (sel) {
    var p = sel.getAttribute('data-select').split(':'), g = gridById(p[0]), attr = p[1]; if (!g) return;
    sel.addEventListener('change', function () { g._f[attr] = sel.value; apply(g); });
  });
  document.querySelectorAll('[data-prov-chips]').forEach(function (grp) {
    var g = gridById(grp.getAttribute('data-prov-chips')); if (!g) return;
    function showCtx(name) { document.querySelectorAll('[data-prov-ctx]').forEach(function (el) { el.style.display = (el.getAttribute('data-prov-ctx') === name) ? '' : 'none'; }); }
    grp.querySelectorAll('.chip').forEach(function (ch) {
      ch.addEventListener('click', function () {
        grp.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
        ch.classList.add('active'); g._f.jur = ch.dataset.prov; g.dataset.q = ''; var si = document.querySelector('[data-search="' + g.id + '"]'); if (si) si.value = ''; apply(g); showCtx(ch.dataset.prov);
      });
    });
    var act = grp.querySelector('.chip.active'); if (act) { g._f.jur = act.dataset.prov; showCtx(act.dataset.prov); }
  });
  document.querySelectorAll('.tracker-grid[id]').forEach(apply);
})();
