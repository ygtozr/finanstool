import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import Framework7 from 'framework7/lite';
import SheetModule from 'framework7/components/sheet';
import Framework7React, { App, View, Page, Toolbar, Link, Button, List, Sheet, Segmented } from 'framework7-react';
import { overview } from './legacy-adapter';
import './pilot.css';
Framework7.use([Framework7React, SheetModule]);

export function LoadingState() { return <span className="pilot-loading" role="status">Yükleniyor…</span>; }
export function ErrorState({ message = 'Veri alınamadı', retry }) {
  return <span className="pilot-error" role="status">{message}{retry ? <Button type="button" onClick={retry}>Tekrar dene</Button> : null}</span>;
}
export function Section({ title, note, actions, children }) {
  return <section className="pilot-section" aria-label={title}>
    <header><div><h2>{title}</h2>{note ? <p>{note}</p> : null}</div><div className="pilot-section-actions">{actions}</div></header>
    {children}
  </section>;
}
export function MarketCard({ item }) {
  const error = item.price === 'Veri alınamadı';
  return <Button type="button" className="pilot-market-card" disabled={item.disabled} title={item.title}
    onClick={() => overview.market(item.symbol)}>
    <span className="pilot-market-label">{item.label}</span>
    {error ? <ErrorState /> : item.price === 'Yükleniyor…' ? <LoadingState /> : <strong>{item.price}</strong>}
    <small className={item.tone}>{item.change}</small>
  </Button>;
}
export function FavoriteRow({ item, openActions, order }) {
  const row = useRef(null), handle = useRef(null);
  useEffect(() => {
    // Reuse existing touch/keyboard reordering. A fresh handle avoids duplicate listeners.
    window.OzerNativeUI.reorder(handle.current.el, row.current, row.current.parentNode, ':scope > .pilot-favorite-row', () => {
      overview.reorder([...row.current.parentNode.children].map(node => node.dataset.symbol));
    });
  }, [order]);
  return <li ref={row} className="pilot-favorite-row" data-symbol={item.symbol}>
    <Button type="button" ref={handle} className="pilot-favorite-main" title={item.title} onClick={() => overview.favorite(item.symbol)}>
      <span className="pilot-logo"><span>{item.displaySymbol.slice(0, 2)}</span>{item.logo ? <img src={item.logo} alt="" onError={event => { event.currentTarget.hidden = true; }} /> : null}</span>
      <span className="pilot-identity"><strong>{item.displaySymbol}</strong><small>{item.name}</small></span>
      <span className="pilot-quote">{item.price === 'Veri alınamadı' ? <ErrorState /> : item.price === 'Yükleniyor…' ? <LoadingState /> : <strong>{item.price}</strong>}<small className={item.tone}>{item.change}</small><time>{item.time}</time></span>
    </Button>
    <Button type="button" className="pilot-favorite-actions" aria-label={`${item.displaySymbol} işlemleri`} onClick={() => openActions(item)}>⋯</Button>
  </li>;
}
const tabs = [['main', 'Özet', 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9'], ['chart', 'Grafik', 'M3 3v18h18M6 15l4-5 4 3 6-8'], ['portfolio', 'Portföy', 'M4 6h16v15H4zM8 6V3h8v3M4 11h16M10 11v3h4v-3'], ['other', 'Diğer', 'M5 12h.01M12 12h.01M19 12h.01']];
export function MobileTabBar({ view, authenticated }) {
  return createPortal(<Toolbar tabbar icons bottom className="pilot-tabbar" hidden={!authenticated}>
    {tabs.map(([id, label, icon]) => <Link key={id} href="#" className={id === view ? 'tab-link-active' : ''}
      aria-current={id === view ? 'page' : undefined} aria-label={label}
      onClick={event => { event.preventDefault(); overview.navigate(id); }}>
      <svg className="pilot-tab-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={id === 'other' ? 4 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg><span className="tabbar-label">{label}</span>
    </Link>)}
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
    document.title = 'Özer Finans v8.1 — Ön izleme';
    document.documentElement.dataset.overviewPilot = 'ready';
    return () => { restore(); document.title = oldTitle; delete document.documentElement.dataset.overviewPilot; };
  }, []);
  return <App theme="ios" name="Özer Finans" className={`pilot-app ${state.theme === 'dark' ? 'dark' : ''}`}
    touch={{ fastClicks: false }} view={{ router: false }}>
    <View main router={false}><Page name="overview" className="pilot-page">
      <header className="pilot-brand"><img src="assets/brand-symbol-a.png?v=7.9" alt="" /><div><h1>Özer Finans</h1><small>v8.1 · Ön izleme</small></div></header>
      <div className="pilot-preferences"><span>Özet</span><Segmented strong aria-label="Görünüm modu">
        {['system', 'light', 'dark'].map(mode => <Button type="button" key={mode} active={(state.themePreference) === mode} onClick={() => overview.theme(mode)}>{({ system: 'Sistem', light: 'Açık', dark: 'Koyu' })[mode]}</Button>)}
      </Segmented></div>
      {refreshError ? <ErrorState message={refreshError} retry={refresh} /> : null}
      <Section title="Piyasa Özeti" note={state.marketUpdated} actions={<><Button type="button" disabled={state.busy} onClick={refresh} aria-label="Piyasa verilerini yenile">{state.busy ? 'Yenileniyor…' : 'Yenile'}</Button><Button type="button" className="pilot-settings" onClick={overview.settings} aria-label="Piyasa özetini düzenle">⚙</Button></>}>
        <div className="pilot-market-grid">{state.markets.map(item => <MarketCard key={item.symbol} item={item} />)}</div>
        {!state.markets.length ? state.busy ? <LoadingState /> : <p className="pilot-empty">{state.marketCount ? 'Fiyatları görmek için Yenile’ye dokunun.' : 'Piyasa listesine ayarlardan varlık ekleyebilirsiniz.'}</p> : null}
      </Section>
      <Section title="Favoriler" note={state.favoriteUpdated} actions={<Button type="button" disabled={state.busy} onClick={refresh} aria-label="Favorileri yenile">Yenile</Button>}>
        <List className="pilot-favorites">{state.favorites.map(item => <FavoriteRow key={`${item.symbol}:${order}`} order={order} item={item} openActions={setActions} />)}</List>
        {!state.favorites.length ? <p className="pilot-empty">Henüz favori yok. Hisse veya fon arayarak ekleyin.</p> : null}
        <div ref={search} className="pilot-search-slot" />
      </Section>
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
