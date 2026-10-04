import React, { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { overview } from './legacy-adapter';

// All displayed values are formatted by the existing detail service.
// The native dialog retains top-layer focus, Escape, backdrop and scroll behavior.
export function FavoriteDetail() {
  const { detail } = useSyncExternalStore(overview.subscribe, overview.getSnapshot);
  const ready = detail?.status === 'ready';
  useLayoutEffect(() => { document.getElementById('favoriteDetailBody').scrollTop = 0; }, [detail?.symbol]);
  useEffect(() => {
    const dialog = document.getElementById('favoriteDetailDialog');
    const trapFocus = event => {
      if (event.key !== 'Tab' || !dialog.open) return;
      const buttons = [...dialog.querySelectorAll('button:not(:disabled)')], first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', trapFocus);
    return () => dialog.removeEventListener('keydown', trapFocus);
  }, []);
  return <>
    <header className="favorite-detail-head">
      <h2 id="favoriteDetailTitle">Favori Ayrıntısı</h2>
      <button id="favoriteDetailClose" className="favorite-detail-close" type="button" aria-label="Hızlı detayı kapat" onClick={overview.closeDetail}>Kapat</button>
    </header>
    {!ready ? <div id="favoriteDetailIdentity" className="favorite-detail-identity" hidden /> : null}
    <div id="favoriteDetailBody" className="favorite-detail-body" aria-live="polite">
      {ready ? <>
        <section className="favorite-detail-hero">
          <DetailIdentity key={detail.symbol} detail={detail} />
          <div className="favorite-detail-price"><strong>{detail.price}</strong><span className={`favorite-detail-change ${detail.tone}`}>{detail.change}</span></div>
          <small className="favorite-detail-time">{detail.time}</small>
          <small className="favorite-detail-time">{detail.priceSource}</small>
        </section>
        <section className="favorite-detail-metrics-card"><h3>Temel Bilgiler</h3>
          <dl className="favorite-detail-metrics">{detail.metrics.map(([label, value]) => <div className="favorite-detail-metric" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {detail.fundamentalsSource ? <p className="favorite-detail-source">{detail.fundamentalsSource}</p> : null}
        </section>
      </> : detail?.status === 'error' ? <p className="favorite-detail-error" role="alert">{detail.message}</p> : <p className="favorite-detail-loading" role="status">Veriler yükleniyor…</p>}
    </div>
    <footer className="favorite-detail-actions">
      <button id="favoriteDetailChart" type="button" onClick={() => overview.detailAction('chart')}>Grafiği Aç</button>
      <button id="favoriteDetailAlarm" type="button" onClick={() => overview.detailAction('alarm')}>Alarm Kur</button>
      <button id="favoriteDetailPortfolio" type="button" onClick={() => overview.detailAction('portfolio')}>Portföye Ekle</button>
    </footer>
  </>;
}
function DetailIdentity({ detail }) {
  const [source, setSource] = useState(0);
  return <div id="favoriteDetailIdentity" className="favorite-detail-identity">
    <span className="favorite-card-badge"><span>{detail.badge}</span>{detail.logoSources[source] ? <img className={detail.logoClass} src={detail.logoSources[source]} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" onError={() => setSource(index => index + 1)} /> : null}</span>
    <h3>{detail.displaySymbol}</h3><p>{detail.name}</p>
  </div>;
}
