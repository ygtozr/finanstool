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
for (const selector of ['html', '#marketRefresh', '#submitButton', '#customPeriod', '#exportPng', '#authGate', '.app-view']) {
  document.querySelectorAll(selector).forEach(node => observer.observe(node, { attributes: true, childList: ['#customPeriod', '#exportPng', '#submitButton'].includes(selector), subtree: ['#customPeriod', '#exportPng', '#submitButton'].includes(selector) }));
}
window.addEventListener('ozer:overview-change', update);
window.addEventListener('ozer:local-data-change', update);
export const overview = {
  sheetOpen: open => legacy.sheetOpen(open),
  claimView: () => legacy.claimView(),
  mountNativePage: (view, content) => legacy.mountNativePage(view, content),
  portfolioAction: id => legacy.portfolioAction(id), settingsToggle: (id, checked) => legacy.settingsToggle(id, checked),
  mountChartShell: slots => legacy.mountChartShell(slots), chartPeriod: range => legacy.chartPeriod(range), chartAction: id => legacy.chartAction(id),
  chartQuery: value => legacy.chartQuery(value), chartSelect: (item, scroll) => legacy.chartSelect(item, scroll), chartFavorite: () => legacy.chartFavorite(),
  claimDetailView: () => legacy.claimDetailView(),
  closeDetail: () => legacy.closeDetail(), detailAction: action => legacy.detailAction(action),
  getSnapshot: () => snapshot,
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  refresh: () => legacy.refresh(), navigate: view => legacy.navigate(view),
  theme: mode => legacy.theme(mode), settings: () => legacy.settings(),
  market: symbol => legacy.market(symbol), favorite: (symbol, action) => legacy.favorite(symbol, action),
  reorder: symbols => legacy.reorder(symbols),
  search: (query, deliver) => legacy.search(query, deliver),
  resolveAsset: query => legacy.resolveAsset(query), displaySymbol: symbol => legacy.displaySymbol(symbol),
  positionSuggestions: (input, list) => legacy.positionSuggestions(input, list),
  addFavorite: item => legacy.addFavorite(item), addMarket: item => legacy.addMarket(item),
  removeMarket: symbol => legacy.removeMarket(symbol), reorderMarkets: symbols => legacy.reorderMarkets(symbols),
};
