import React, { useEffect, useRef, useState } from 'react';
import { overview } from './legacy-adapter';

// Shared search UI; legacy services still own providers, ranking and cache.
export function AssetSearch({ kind = 'favorite', onAdd, chartState }) {
  const chart = kind === 'chart', market = kind === 'market';
  const [localQuery, setLocalQuery] = useState(''), [items, setItems] = useState([]), [message, setMessage] = useState('');
  const [open, setOpen] = useState(false), [active, setActive] = useState(-1), [busy, setBusy] = useState(false);
  const input = useRef(null), list = useRef(null), generation = useRef(0), editedQuery = useRef(null), cancel = useRef(() => {});
  const query = chart ? chartState.query : localQuery;
  const id = chart ? 'pilotChartSearch' : market ? 'pilotMarketSearch' : 'pilotFavoriteSearch', listId = `${id}Suggestions`;
  useEffect(() => {
    generation.current++;
    setActive(-1);
    // Programmatic chart selections sync the input without starting another search.
    if (chart && editedQuery.current !== query) { setOpen(false); setItems([]); setMessage(''); return; }
    setOpen(query.trim().length >= 2);
    cancel.current = overview.search(query, (results, status = '') => { setItems(results.slice(0, 5)); setMessage(status); });
    return () => cancel.current();
  }, [query, chart]);
  useEffect(() => { if (open) overview.positionSuggestions(input.current, list.current); }, [open, items, message]);
  useEffect(() => () => { generation.current++; cancel.current(); }, []);
  const choose = item => {
    generation.current++; cancel.current(); editedQuery.current = null;
    onAdd(item); if (!chart) setLocalQuery('');
    setItems([]); setMessage(''); setOpen(false); setActive(-1);
    if (!chart) input.current.focus();
  };
  const submit = async event => {
    event.preventDefault();
    if (busy || chartState?.busy || !query.trim()) return input.current.focus();
    if (open && active >= 0 && items[active]) return choose(items[active]);
    if (market && items[0]) return choose(items[0]);
    const request = generation.current;
    setBusy(true);
    try { const item = await overview.resolveAsset(query); if (request === generation.current && item.symbol) choose(item); }
    catch { if (request === generation.current) { setMessage('Arama servisine ulaşılamadı.'); setOpen(true); } }
    finally { setBusy(false); }
  };
  const field = <input id={id} ref={input} type="search" role="combobox" aria-autocomplete="list" aria-controls={listId}
    aria-expanded={open && Boolean(items.length || message)} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
    autoComplete="off" maxLength={market ? undefined : 20} placeholder={chart ? 'Hisse ara: AAPL veya THYAO.IS' : market ? 'Piyasa verisi ara' : 'Favorilere hisse ekle'} required={chart}
    value={query} onChange={event => { generation.current++; editedQuery.current = event.target.value; chart ? overview.chartQuery(event.target.value) : setLocalQuery(event.target.value); }}
    onFocus={() => { if (items.length || message) setOpen(true); }} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1); }
      else if (['ArrowDown', 'ArrowUp'].includes(event.key) && items.length) {
        event.preventDefault(); setOpen(true); setActive(index => index < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
      }
    }} />;
  const options = <ul id={listId} ref={list} className={`search-suggestions ${open && (items.length || message) ? 'visible' : ''}`} role="listbox"
    aria-label={market ? 'Piyasa verisi önerileri' : chart ? 'Hisse önerileri' : 'Favorilere eklenecek hisse önerileri'}>
    {items.map((item, index) => <li key={item.symbol}><button id={`${listId}-${index}`} className="suggestion" type="button" role="option"
      aria-selected={index === active} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}>
      {overview.displaySymbol(item.symbol)} · {item.name || item.symbol}
    </button></li>)}
    {!items.length && message ? <li className="suggestion-empty" role="status">{message}</li> : null}
  </ul>;
  return <form id={chart ? 'pilotChartSearchForm' : undefined} className={chart ? undefined : market ? 'market-settings-search' : 'favorite-add-search'} role="search" onSubmit={submit}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label className="sr-only" htmlFor={id}>{chart ? 'Hisse ara' : market ? 'Piyasa verisi ara' : 'Favorilere eklenecek hisseyi ara'}</label>
    {chart ? <>
      <div className="search-field">{field}<button id="pilotChartFavorite" className={`favorite-toggle ${chartState.isFavorite ? 'is-favorite' : ''}`} type="button" aria-label={chartState.isFavorite ? 'Hisseyi favorilerden çıkar' : 'Hisseyi favorilere ekle'} aria-pressed={chartState.isFavorite} title={chartState.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'} onClick={overview.chartFavorite}>{chartState.isFavorite ? '★' : '☆'}</button>{options}</div>
      <button id="pilotChartSubmit" type="submit" disabled={busy || chartState.busy}>{busy ? 'Yükleniyor…' : chartState.buttonLabel}</button>
    </> : <>{field}<button type="submit" disabled={busy} aria-label={market ? 'Piyasa verisi ekle' : 'Hisseyi favorilere ekle'}>+</button>{options}</>}
  </form>;
}
