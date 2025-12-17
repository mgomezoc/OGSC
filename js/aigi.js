(function () {
  'use strict';

  // Solo inicializa tabs dentro de la sección AIGI
  const root =
    document.querySelector('#aigi [data-fb-tabs]') || document.getElementById('aigi-detalle');

  if (!root) return;

  initTabsGroup(root, { scope: 'aigi' });

  function initTabsGroup(rootEl, opts) {
    const scope = (opts?.scope || 'aigi').toLowerCase();

    const tabs = Array.from(rootEl.querySelectorAll('[data-fb-tab]'));
    if (!tabs.length) return;

    const explicitPanels = Array.from(rootEl.querySelectorAll('[data-fb-panel]'));
    const hasExplicitPanels = explicitPanels.length > 0;

    const panelByName = new Map();
    const inferredPanels = [];

    if (!hasExplicitPanels) {
      const seen = new Set();
      tabs.forEach(btn => {
        const name = (btn.getAttribute('data-fb-tab') || '').toLowerCase();
        const panelId = btn.getAttribute('aria-controls');
        if (!name || !panelId) return;

        const panel = rootEl.querySelector(`#${CSS.escape(panelId)}`);
        if (!panel) return;

        panelByName.set(name, panel);
        if (!seen.has(panel)) {
          seen.add(panel);
          inferredPanels.push(panel);
        }
      });
    }

    // Deep-link: #aigi-resumen, #aigi-productos, etc.
    const names = tabs
      .map(t => (t.getAttribute('data-fb-tab') || '').toLowerCase())
      .filter(Boolean);

    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^#${esc(scope)}-(${names.map(esc).join('|')})$`, 'i');

    const fromHash = () => {
      const h = (location.hash || '').toLowerCase();
      const m = h.match(re);
      return m ? m[1] : null;
    };

    const setActive = (name, pushHash = true) => {
      const key = (name || '').toLowerCase();

      tabs.forEach(btn => {
        const active = (btn.getAttribute('data-fb-tab') || '').toLowerCase() === key;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.tabIndex = active ? 0 : -1;
      });

      if (hasExplicitPanels) {
        explicitPanels.forEach(panel => {
          const active = (panel.getAttribute('data-fb-panel') || '').toLowerCase() === key;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
      } else {
        inferredPanels.forEach(panel => {
          panel.classList.remove('is-active');
          panel.hidden = true;
        });
        const panel = panelByName.get(key);
        if (panel) {
          panel.classList.add('is-active');
          panel.hidden = false;
        }
      }

      if (pushHash) {
        history.replaceState(null, '', `#${scope}-${key}`);
      }
    };

    tabs.forEach(btn => {
      btn.addEventListener('click', () => setActive(btn.getAttribute('data-fb-tab')));
    });

    const nav = rootEl.querySelector('.fb-tabs-nav');
    nav?.addEventListener('keydown', e => {
      const current = document.activeElement;
      const idx = tabs.indexOf(current);
      if (idx < 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();

        let next;
        if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        else if (e.key === 'ArrowRight') next = tabs[idx + 1] || tabs[0];
        else next = tabs[idx - 1] || tabs[tabs.length - 1];

        next.focus();
        next.click();
      }
    });

    const initial =
      fromHash() ||
      tabs
        .find(t => t.classList.contains('is-active') || t.getAttribute('aria-selected') === 'true')
        ?.getAttribute('data-fb-tab') ||
      tabs[0].getAttribute('data-fb-tab') ||
      'resumen';

    setActive(initial, false);

    window.addEventListener('hashchange', () => {
      const tab = fromHash();
      if (tab) setActive(tab, false);
    });
  }
})();
