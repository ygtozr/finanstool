import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import Framework7 from 'framework7/lite';
import SheetModule from 'framework7/components/sheet';
import PopupModule from 'framework7/components/popup';
import ToggleModule from 'framework7/components/toggle';
import Framework7React, { App, View, Page, Toolbar, Button, Sheet } from 'framework7-react';
import { overview } from './legacy-adapter';
import { AssetSearch } from './AssetSearch';
import { MarketSettings } from './MarketSettings';
import { FavoriteDetail } from './FavoriteDetail';
import { ChartShell } from './ChartShell';
import { PortfolioShell, OtherShell } from './RemainingPages';
import appPackage from '../../package.json';
import './pilot.css';
Framework7.use([Framework7React, SheetModule, PopupModule, ToggleModule]);
document.documentElement.dataset.appVersion = appPackage.version;
document.getElementById('desktopVersion').textContent = `v${appPackage.version}`;

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
  return <button type="button" className="market-card pilot-market-card" disabled={item.disabled} title={item.title} aria-label={`${item.label}, ${item.price}, ${item.change}`}
    onClick={() => overview.market(item.symbol)}>
    <span className="market-card-label">{item.label} <small className="market-card-symbol">{item.symbolLabel}</small></span>
    <strong className="market-card-value">{item.price}</strong>
    <small className={`market-card-change ${item.tone}`}>{item.change}</small>
  </button>;
}
export function FavoriteRow({ item, openActions, order, actionsOpen }) {
  const row = useRef(null), handle = useRef(null), keyboard = useRef(false);
  const [logoSource, setLogoSource] = useState(0);
  const logoKey = item.logoSources.join('|');
  useEffect(() => { setLogoSource(0); }, [logoKey]);
  useEffect(() => {
    window.OzerNativeUI.reorder(handle.current, row.current, row.current.parentNode, ':scope > .pilot-favorite-row', () => {
      const container = row.current.parentNode, focused = keyboard.current;
      overview.reorder([...container.children].map(node => node.dataset.symbol));
      if (focused) requestAnimationFrame(() => [...container.children].find(node => node.dataset.symbol === item.symbol)?.querySelector('.favorite-card')?.focus());
    });
  }, [order]);
  return <li ref={row} className="favorite-row pilot-favorite-row" data-symbol={item.symbol}>
    <button type="button" ref={handle} onKeyDownCapture={event => { keyboard.current = event.altKey && event.key.startsWith("Arrow"); }} onPointerDownCapture={() => { keyboard.current = false; }} className="favorite-card pilot-favorite-main" title={item.title} aria-label={`${item.symbol} hızlı detay. Sıralamak için basılı tutup sürükleyin.`} onClick={() => overview.favorite(item.symbol)}>
      <span className="favorite-card-badge"><span>{item.badge}</span>{item.logoSources[logoSource] ? <img className={item.logoClass} src={item.logoSources[logoSource]} alt="" referrerPolicy="no-referrer" decoding="async" onError={() => setLogoSource(index => index + 1)} /> : null}</span>
      <span className="favorite-card-head"><strong className="favorite-card-symbol">{item.displaySymbol}</strong><small className="favorite-card-name">{item.name}</small></span>
      <span className="favorite-card-quote pilot-quote"><strong className="favorite-card-price">{item.price}</strong><span className={`favorite-change ${item.tone}`}>{item.change}</span><small className="favorite-market-time">{item.time}</small></span>
    </button>
    <div className="favorite-actions"><button type="button" className="favorite-menu-trigger" aria-label={`${item.displaySymbol} işlemleri`} aria-haspopup="dialog" aria-expanded={actionsOpen} onClick={() => openActions(item)}>⋯</button><button type="button" className="favorite-remove" aria-label={`${item.displaySymbol} favorilerden çıkar`} onClick={() => overview.favorite(item.symbol, 'remove')}>★</button></div>
  </li>;
}
const tabs = [['main', 'Özet', 'M3 11 12 3l9 8M5 10v11h5v-6h4v6h5V10'], ['chart', 'Grafik', 'M3 3v18h18M6 15l5-6 4 3 5-7'], ['portfolio', 'Portföy', 'M4 7h16v13H4zM7 4h10'], ['other', 'Diğer', 'M5 12h.01M12 12h.01M19 12h.01']];
export function MobileTabBar({ view, authenticated }) {
  if (!authenticated) return null;
  return createPortal(<Toolbar bottom className="mobile-bottom-nav pilot-tabbar" aria-label="Mobil gezinme">
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sheet = useRef(null), actionOpener = useRef(null), sheetLocks = useRef([]);
  const unlockSheet = () => {
    sheetLocks.current.forEach(([node, inert]) => { node.inert = inert; });
    sheetLocks.current = [];
    overview.sheetOpen(false);
  };
  const openActions = item => { actionOpener.current = document.activeElement; setActions(item); };
  const closeSheet = () => {
    unlockSheet(); setActions(null);
    if (!document.querySelector('dialog[open]') && actionOpener.current?.isConnected) actionOpener.current.focus();
  };
  const trapSheetFocus = event => {
    if (event.key !== 'Tab') return;
    const buttons = [...sheet.current.el.querySelectorAll('button:not(:disabled)')];
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  useEffect(() => {
    const element = sheet.current.el;
    element.addEventListener('keydown', trapSheetFocus);
    return () => element.removeEventListener('keydown', trapSheetFocus);
  }, []);
  const order = state.favorites.map(item => item.symbol).join('|');
  const refresh = async () => {
    setRefreshError('');
    try { await overview.refresh(); } catch { setRefreshError('Yenileme tamamlanamadı. Mevcut fiyatlar korunuyor.'); }
  };
  useEffect(() => {
    const release = overview.claimView();
    const oldTitle = document.title;
    document.title = `Özer Finans v${appPackage.version} — Ön izleme`;
    document.documentElement.dataset.overviewPilot = 'ready';
    return () => { unlockSheet(); release(); document.title = oldTitle; delete document.documentElement.dataset.overviewPilot; };
  }, []);
  return <App theme="ios" name="Özer Finans" className={`pilot-app ${state.theme === 'dark' ? 'dark' : ''}`}
    touch={{ fastClicks: false }} clicks={{ externalLinks: '.external, a[download], #inviteLink' }} view={{ router: false }}>
    <View main router={false}><Page name="overview" className="pilot-page">
      <h1 className="page-brand pilot-brand"><img className="brand-lockup-mark" src="assets/brand-symbol-a.png?v=7.9" alt="" /><span className="brand-lockup-name">Özer Finans</span><span className="version-badge">v9.0.2</span></h1>
      {refreshError ? <ErrorState message={refreshError} retry={refresh} /> : null}
      <div className="app-layout"><section className="chart-panel">
      <Section className="market-summary" title="Piyasa Özeti" note={state.marketUpdated} actions={<div className="market-actions"><button type="button" id="pilotMarketRefresh" disabled={state.busy} onClick={refresh} aria-label="Piyasa verilerini yenile">{state.busy ? 'Yenileniyor…' : 'Yenile'}</button><button type="button" id="pilotMarketSettings" onClick={() => setSettingsOpen(true)} aria-label="Piyasa özetini düzenle">⚙</button></div>}>
        <div className="market-cards" aria-busy={state.busy}>{state.markets.map(item => <MarketCard key={item.symbol} item={item} />)}{!state.markets.length ? <p className="market-settings-empty">Dişli düğmesinden piyasa verisi ekleyin.</p> : null}</div>
      </Section>
      <Section className="favorites-panel" title="Favoriler" note={state.favoriteUpdated} actions={<button type="button" id="pilotFavoriteRefresh" disabled={state.busy} onClick={refresh} aria-label="Favorileri yenile">Yenile</button>}>
        {!state.favorites.length ? <p className="favorites-note">Henüz favori hisse yok.</p> : null}
        <ul className="favorites-list pilot-favorites">{state.favorites.map(item => <FavoriteRow key={`${item.symbol}:${order}`} order={order} item={item} openActions={openActions} actionsOpen={actions?.symbol === item.symbol} />)}</ul>
        <AssetSearch onAdd={overview.addFavorite} />
      </Section>
      </section></div>
    </Page></View>
    <MarketSettings opened={settingsOpen} onClose={() => setSettingsOpen(false)} items={state.marketItems} />
    <ChartShell chart={state.chart} />
    <PortfolioShell state={state.portfolioControls} />
    <OtherShell theme={state.themePreference} settings={state.settings} />
    <MobileTabBar view={state.view} authenticated={state.authenticated} />
    {createPortal(<Sheet ref={sheet} role="dialog" aria-modal="true" aria-labelledby="pilotActionsTitle" className="pilot-action-sheet" opened={Boolean(actions)} backdrop closeByBackdropClick closeOnEscape swipeToClose
      containerEl="body" onSheetOpen={() => {
        unlockSheet();
        sheetLocks.current = [...document.querySelectorAll('body > main, #pilot-navigation, .desktop-sidebar')].map(node => [node, node.inert]);
        sheetLocks.current.forEach(([node]) => { node.inert = true; });
        overview.sheetOpen(true);
      }} onSheetOpened={() => sheet.current.el.querySelector('button')?.focus()} onSheetClosed={closeSheet}>
      <div className="pilot-sheet-content"><header><h2 id="pilotActionsTitle">{actions?.displaySymbol} işlemleri</h2><Button type="button" onClick={() => setActions(null)} aria-label="İşlemleri kapat">Kapat</Button></header>
        {[['chart', 'Grafiği aç'], ['alarm', 'Fiyat alarmı kur'], ['portfolio', 'Portföye ekle'], ['remove', 'Favorilerden çıkar']].map(([action, label]) => <Button type="button" key={action} className={action === 'remove' ? 'negative' : ''} onClick={() => { const symbol = actions.symbol; setActions(null); overview.favorite(symbol, action); }}>{label}</Button>)}
      </div>
    </Sheet>, document.body)}
  </App>;
}
const mount = document.createElement('div'); mount.id = 'overview-react';
const main = document.getElementById('mainView'); main.append(mount);
const navigation = document.createElement('div'); navigation.id = 'pilot-navigation'; document.body.append(navigation);
createRoot(mount).render(<AppShell />);

// Retain the native top-layer dialog, focus and scroll lock; React owns its contents.
overview.claimDetailView();
createRoot(document.getElementById('favoriteDetailDialog')).render(<FavoriteDetail />);
