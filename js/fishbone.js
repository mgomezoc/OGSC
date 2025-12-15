(function () {
  'use strict';

  const root = document.querySelector('[data-fb-tabs]');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[data-fb-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-fb-panel]'));

  const setActive = (name, pushHash = true) => {
    tabs.forEach(btn => {
      const active = btn.getAttribute('data-fb-tab') === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.tabIndex = active ? 0 : -1;
    });

    panels.forEach(panel => {
      const active = panel.getAttribute('data-fb-panel') === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    if (pushHash) {
      // hash deep-link compatible with existing smooth scroll handler
      const hash = `#fishbone-${name}`;
      history.replaceState(null, '', hash);
    }

    // Lazy init charts (only once) when "pruebas" opens
    if (name === 'pruebas') initChartsOnce();
  };

  // Click
  tabs.forEach(btn => {
    btn.addEventListener('click', () => setActive(btn.getAttribute('data-fb-tab')));
  });

  // Keyboard (left/right)
  root.querySelector('.fb-tabs-nav')?.addEventListener('keydown', e => {
    const current = document.activeElement;
    const idx = tabs.indexOf(current);
    if (idx < 0) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (tabs[idx + 1] || tabs[0]) : (tabs[idx - 1] || tabs[tabs.length - 1]);
      next.focus();
      next.click();
    }
  });

  // Deep link:
  // - #fishbone => opens resumen (default)
  // - #fishbone-pruebas => opens pruebas tab
  const fromHash = () => {
    const h = (location.hash || '').toLowerCase();
    const m = h.match(/^#fishbone-(resumen|caracteristicas|historia|ventajas|pruebas|aplicaciones|especificaciones)$/);
    if (m) return m[1];
    return null;
  };

  const initial = fromHash() || 'resumen';
  setActive(initial, false);

  window.addEventListener('hashchange', () => {
    const tab = fromHash();
    if (tab) setActive(tab, false);
  });

  // ------------------------------------------------------------
  // Charts (Chart.js)
  // ------------------------------------------------------------
  let chartsInited = false;

  function initChartsOnce() {
    if (chartsInited) return;
    if (typeof window.Chart === 'undefined') return;

    const leak = document.getElementById('fbChartLeakage');
    const taluft = document.getElementById('fbChartTaluft');
    const comp = document.getElementById('fbChartCompression');

    if (!leak || !taluft || !comp) return;

    // 1) Leakage
    new Chart(leak, {
      type: 'bar',
      data: {
        labels: ['Fishbone®', 'Camprofile', 'Espirometálica'],
        datasets: [{ label: 'Tasa de fuga (1×10⁻³ cm³/s)', data: [0.02, 0.2, 0.6] }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } },
      },
    });

    // 2) TA-LUFT (log scale)
    new Chart(taluft, {
      type: 'bar',
      data: {
        labels: ['Fishbone®', 'Camprofile', 'Espirometálica'],
        datasets: [{ label: 'Tasa de fuga (mbar*l)/(s*m)', data: [1.6e-8, 1.0e-6, 1.0e-4] }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: {
            type: 'logarithmic',
            min: 1e-9,
            max: 1e-3,
            ticks: {
              callback: (v) => {
                const val = Number(v);
                if (!isFinite(val)) return '';
                return val.toExponential(0);
              },
            },
          },
        },
      },
    });

    // 3) Compression (Fishbone shown as 205+)
    new Chart(comp, {
      type: 'bar',
      data: {
        labels: ['Fishbone®', 'Espirometálica'],
        datasets: [{ label: 'Presión aplastamiento (MPa)', data: [205, 54] }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.raw;
                return ctx.label === 'Fishbone®' ? `Fishbone®: >${v} MPa` : `${ctx.label}: ${v} MPa`;
              },
            },
          },
        },
        scales: { y: { beginAtZero: true } },
      },
    });

    chartsInited = true;
  }
})();
