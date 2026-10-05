import React, { useState } from 'react';
import { Button, Segmented } from 'framework7-react';
import { overview } from './legacy-adapter';

export function ChartAssets({ favorites, portfolio }) {
  const [panel, setPanel] = useState(null);
  return <section className="chart-asset-switcher" aria-label="Grafikte gösterilecek kayıtlı hisseler">
    <Segmented className="chart-asset-switcher-buttons">
      {[['favorites', 'Favoriler'], ['portfolio', 'Portföy']].map(([kind, label]) => <Button type="button" key={kind} id={`pilotChart${label === 'Favoriler' ? 'Favorites' : 'Portfolio'}Toggle`} aria-expanded={panel === kind} aria-controls={`pilotChart-${kind}`} onClick={() => setPanel(current => current === kind ? null : kind)}>{label}</Button>)}
    </Segmented>
    {[['favorites', favorites, 'Henüz favori hisse yok.'], ['portfolio', portfolio, 'Portföyünüzde hisse yok.']].map(([kind, items, empty]) => <div key={kind} id={`pilotChart-${kind}`} className="chart-asset-panel" hidden={panel !== kind}>
      <ul className="chart-asset-list">{items.length ? items.map(item => <AssetRow key={item.symbol} item={item} select={() => { setPanel(null); overview.chartSelect(item, true); }} />) : <li className="chart-asset-empty">{empty}</li>}</ul>
    </div>)}
  </section>;
}
function AssetRow({ item, select }) {
  const [source, setSource] = useState(0);
  return <li><button className="chart-asset-item" type="button" title={`${item.symbol} grafiğini aç`} onClick={select}>
    <span className="chart-asset-logo"><span>{item.badge}</span>{item.logoSources[source] ? <img src={item.logoSources[source]} className={item.logoClass} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" onError={() => setSource(index => index + 1)} /> : null}</span>
    <span className="chart-asset-name"><strong>{item.displaySymbol}</strong><small>{item.name}</small></span><span className="chart-asset-chevron" aria-hidden="true">›</span>
  </button></li>;
}
