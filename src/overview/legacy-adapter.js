// Legacy services and formatters own data; React owns visible Overview rendering.
const legacy = window.OzerOverviewLegacy;
const $ = selector => document.querySelector(selector);
// Only shell/auth attributes remain observed. Prices and lists come directly
// from the service-owned projection, even when the legacy lists are empty.
function read() {
  return {
    ...legacy.getData(),
    view: $('.app-view.active')?.id.replace('View', '') || 'main',
    theme: document.documentElement.dataset.theme || 'dark',
    themePreference: localStorage.getItem('finans-grafigi-theme') || 'system',
    authenticated: $('#authGate').hidden,
    busy: $('#marketRefresh').disabled,
  };
}
let snapshot = read(), serialized = JSON.stringify(snapshot), pending = false;
const listeners = new Set();
function update() {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    const next = read(), json = JSON.stringify(next);
    if (json === serialized) return;
    snapshot = next; serialized = json;
    listeners.forEach(listener => listener());
  });
}
const observer = new MutationObserver(update);
for (const selector of ['html', '#marketRefresh', '#authGate', '.app-view']) {
  document.querySelectorAll(selector).forEach(node => observer.observe(node, { attributes: true }));
}
window.addEventListener('ozer:overview-change', update);
window.addEventListener('ozer:local-data-change', update);
export const overview = {
  sheetOpen: open => legacy.sheetOpen(open),
  claimView: () => legacy.claimView(),
  getSnapshot: () => snapshot,
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  refresh: () => legacy.refresh(), navigate: view => legacy.navigate(view),
  theme: mode => legacy.theme(mode), settings: () => legacy.settings(),
  market: symbol => legacy.market(symbol), favorite: (symbol, action) => legacy.favorite(symbol, action),
  reorder: symbols => legacy.reorder(symbols),
  mountSearch(host) {
    const form = $('#favoriteAddForm'), parent = form.parentNode, next = form.nextSibling;
    host.append(form);
    return () => parent.insertBefore(form, next);
  },
};
