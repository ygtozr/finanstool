// Transitional read model. Legacy rendering/formatting, auth, refresh and storage
// stay authoritative. React owns only the new visible Overview DOM.
const legacy = window.OzerOverviewLegacy;
const $ = selector => document.querySelector(selector);
const text = (node, selector) => node.querySelector(selector)?.textContent?.trim() || '';
function read() {
  return {
    view: $('.app-view.active')?.id.replace('View', '') || 'main',
    theme: document.documentElement.dataset.theme || 'dark',
    themePreference: localStorage.getItem('finans-grafigi-theme') || 'system',
    authenticated: $('#authGate').hidden,
    busy: $('#marketRefresh').disabled,
    marketCount: legacy.marketCount(),
    marketUpdated: $('#marketUpdated').textContent,
    favoriteUpdated: $('#favoriteUpdated').textContent,
    markets: [...$('#marketCards').querySelectorAll('.market-card')].map(node => ({
      symbol: node.dataset.symbol, label: text(node, '.market-card-label'),
      price: text(node, '.market-card-value'), change: text(node, '.market-card-change'),
      tone: node.querySelector('.market-card-change').classList.contains('negative') ? 'negative' : 'positive',
      disabled: node.disabled, title: node.title,
    })),
    favorites: [...$('#favoritesList').children].map(node => ({
      symbol: node.dataset.symbol, displaySymbol: text(node, '.favorite-card-symbol'),
      name: text(node, '.favorite-card-name'), price: text(node, '.favorite-card-price'),
      change: text(node, '.favorite-change'), time: text(node, '.favorite-market-time'),
      tone: node.querySelector('.favorite-change').classList.contains('negative') ? 'negative' : 'positive',
      logo: node.querySelector('.favorite-card-logo')?.getAttribute('src') || '',
      title: node.querySelector('.favorite-card').title,
    })),
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
for (const selector of ['#marketCards', '#favoritesList', '#marketUpdated', '#favoriteUpdated']) {
  observer.observe($(selector), { subtree: true, childList: true, characterData: true, attributes: true });
}
for (const selector of ['html', '#marketRefresh', '#authGate', '.app-view']) {
  document.querySelectorAll(selector).forEach(node => observer.observe(node, { attributes: true }));
}
window.addEventListener('ozer:local-data-change', update);
export const overview = {
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
