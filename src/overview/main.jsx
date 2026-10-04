import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import Framework7 from 'framework7/lite';
import SheetModule from 'framework7/components/sheet';
import Framework7React, { App, View, Page, Toolbar, Button, Sheet } from 'framework7-react';
import { overview } from './legacy-adapter';
import './pilot.css';
Framework7.use([Framework7React, SheetModule]);

export function LoadingState() { return <span className="pilot-loading" role="status">Yükleniyor…</span>; }
export function ErrorState({ message = 'Veri alınamadı', retry }) {
  return <span className="pilot-error" role="status">{message}{retry ? <button type="button" onClick={retry}>Tekrar dene</button> : null}</span>;
}
export function Section({ title, note, actions, children, className }) {
  return <section className={className} aria-label={title}>
    <div className={`${className}-head`}><div><h2>{title}</h2><p className="favorites-note">{note}</p></div>{actions}</div>
    {children}
  </section>;
}
export function MarketCard({ item }) {
  return <button type="button" className="market-card pilot-market-card" disabled={item.disabled} title={item.title}
    onClick={() => overview.market(item.symbol)}>
    <span className="market-card-label">{item.label} <small className="market-card-symbol">{item.symbolLabel}</small></span>
    <strong className="market-card-value">{item.price}</strong>
    <small className={`market-card-change ${item.tone}`}>{item.change}</small>
  </button>;
}
export function FavoriteRow({ item, openActions, order }) {
  const row = useRef(null), handle = useRef(null);
  useEffect(() => {
    window.OzerNativeUI.reorder(handle.current, row.current, row.current.parentNode, ':scope > .pilot-favorite-row', () => {
      overview.reorder([...row.current.parentNode.children].map(node => node.dataset.symbol));
    });
  }, [order]);
  return <li ref={row} className="favorite-row pilot-favorite-row" data-symbol={item.symbol}>
    <button type="button" ref={handle} className="favorite-card pilot-favorite-main" title={item.title} onClick={() => overview.favorite(item.symbol)}>
      <span className="favorite-card-badge"><span>{item.badge}</span>{item.logo ? <img className={item.logoClass} src={item.logo} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>
      <span className="favorite-card-head"><strong className="favorite-card-symbol">{item.displaySymbol}</strong><small className="favorite-card-name">{item.name}</small></span>
      <span className="favorite-card-quote pilot-quote"><strong className="favorite-card-price">{item.price}</strong><span className={`favorite-change ${item.tone}`}>{item.change}</span><small className="favorite-market-time">{item.time}</small></span>
    </button>
    <div className="favorite-actions"><button type="button" className="favorite-menu-trigger" aria-label={`${item.displaySymbol} işlemleri`} onClick={() => openActions(item)}>⋯</button><button type="button" className="favorite-remove" aria-label={`${item.displaySymbol} favorilerden çıkar`} onClick={() => overview.favorite(item.symbol, 'remove')}>★</button></div>
  </li>;
}
const tabs = [['main', 'Özet', 'M3 11 12 3l9 8M5 10v11h5v-6h4v6h5V10'], ['chart', 'Grafik', 'M3 3v18h18M6 15l5-6 4 3 5-7'], ['portfolio', 'Portföy', 'M4 7h16v13H4zM7 4h10'], ['other', 'Diğer', 'M5 12h.01M12 12h.01M19 12h.01']];
export function MobileTabBar({ view, authenticated }) {
  return createPortal(<Toolbar bottom className="mobile-bottom-nav pilot-tabbar" hidden={!authenticated} aria-label="Mobil gezinme">
    {tabs.map(([id, label, icon]) => <button type="button" key={id} className={id === view ? 'is-active' : ''}
      aria-current={id === view ? 'page' : undefined} aria-label={label}
      onClick={() => overview.navigate(id)}>
      <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon} /></svg></span>{label}
    </button>)}
  </Toolbar>, document.getElementById('pilot-navigation'));
}

function AppShell() {
  const state = useSyncExternalStore(overview.subscribe, overview.getSnapshot);
  const [actions, setActions] = useState(null), [refreshError, setRefreshError] = useState('');
  const search = useRef(null);
  const order = state.favorites.map(item => item.symbol).join('|');
  const refresh = async () => {
    setRefreshError('');
    try { await overview.refresh(); } catch { setRefreshError('Yenileme tamamlanamadı. Mevcut fiyatlar korunuyor.'); }
  };
  useEffect(() => {
    const restore = overview.mountSearch(search.current);
    const oldTitle = document.title;
    document.title = 'Özer Finans v8.1.0-preview.2 — Ön izleme';
    document.documentElement.dataset.overviewPilot = 'ready';
    return () => { restore(); document.title = oldTitle; delete document.documentElement.dataset.overviewPilot; };
  }, []);
  return <App theme="ios" name="Özer Finans" className={`pilot-app ${state.theme === 'dark' ? 'dark' : ''}`}
    touch={{ fastClicks: false }} view={{ router: false }}>
    <View main router={false}><Page name="overview" className="pilot-page">
      <h1 className="page-brand pilot-brand"><img className="brand-lockup-mark" src="assets/brand-symbol-a.png?v=7.9" alt="" /><span className="brand-lockup-name">Özer Finans</span><span className="version-badge">v8.1</span></h1>
      {refreshError ? <ErrorState message={refreshError} retry={refresh} /> : null}
      <div className="app-layout"><section className="chart-panel">
      <Section className="market-summary" title="Piyasa Özeti" note={state.marketUpdated} actions={<div className="market-actions"><button type="button" id="pilotMarketRefresh" disabled={state.busy} onClick={refresh} aria-label="Piyasa verilerini yenile">{state.busy ? 'Yenileniyor…' : 'Yenile'}</button><button type="button" id="pilotMarketSettings" onClick={overview.settings} aria-label="Piyasa özetini düzenle">⚙</button></div>}>
        <div className="market-cards">{state.markets.map(item => <MarketCard key={item.symbol} item={item} />)}</div>
      </Section>
      <Section className="favorites-panel" title="Favoriler" note={state.favoriteUpdated} actions={<button type="button" id="pilotFavoriteRefresh" disabled={state.busy} onClick={refresh} aria-label="Favorileri yenile">Yenile</button>}>
        {!state.favorites.length ? <p className="favorites-note">Henüz favori hisse yok.</p> : null}
        <ul className="favorites-list pilot-favorites">{state.favorites.map(item => <FavoriteRow key={`${item.symbol}:${order}`} order={order} item={item} openActions={setActions} />)}</ul>
        <div ref={search} className="pilot-search-slot" />
      </Section>
      </section></div>
    </Page></View>
    <MobileTabBar view={state.view} authenticated={state.authenticated} />
    {createPortal(<Sheet className="pilot-action-sheet" opened={Boolean(actions)} backdrop closeByBackdropClick closeOnEscape swipeToClose
      containerEl="body" onSheetClosed={() => setActions(null)}>
      <div className="pilot-sheet-content"><header><h2>{actions?.displaySymbol} işlemleri</h2><Button type="button" onClick={() => setActions(null)} aria-label="İşlemleri kapat">Kapat</Button></header>
        {[['chart', 'Grafiği aç'], ['alarm', 'Fiyat alarmı kur'], ['portfolio', 'Portföye ekle'], ['remove', 'Favorilerden çıkar']].map(([action, label]) => <Button type="button" key={action} className={action === 'remove' ? 'negative' : ''} onClick={() => { const symbol = actions.symbol; setActions(null); overview.favorite(symbol, action); }}>{label}</Button>)}
      </div>
    </Sheet>, document.body)}
  </App>;
}
const mount = document.createElement('div'); mount.id = 'overview-react';
const main = document.getElementById('mainView'); main.append(mount);
const navigation = document.createElement('div'); navigation.id = 'pilot-navigation'; document.body.append(navigation);
createRoot(mount).render(<AppShell />);
