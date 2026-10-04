import React, { useEffect, useRef, useState } from 'react';
import { overview } from './legacy-adapter';

// Shared UI for Favorites and Market Settings; the existing search service owns
// providers, ranking, normalization and cache. Stale callbacks are cancelled there.
export function AssetSearch({ kind = 'favorite', onAdd }) {
  const [query, setQuery] = useState(''), [items, setItems] = useState([]), [message, setMessage] = useState('');
  const [open, setOpen] = useState(false), [active, setActive] = useState(-1), [busy, setBusy] = useState(false);
  const input = useRef(null), list = useRef(null), generation = useRef(0);
  const market = kind === 'market', id = market ? 'pilotMarketSearch' : 'pilotFavoriteSearch', listId = `${id}Suggestions`;
  useEffect(() => {
    generation.current++;
    setActive(-1);
    setOpen(query.trim().length >= 2);
    return overview.search(query, (results, status = '') => { setItems(results.slice(0, 5)); setMessage(status); });
  }, [query]);
  useEffect(() => { if (open) overview.positionSuggestions(input.current, list.current); }, [open, items, message]);
  useEffect(() => () => { generation.current++; }, []);
  const choose = item => {
    generation.current++; onAdd(item); setQuery(''); setItems([]); setMessage(''); setOpen(false); input.current.focus();
  };
  const submit = async event => {
    event.preventDefault();
    if (busy || !query.trim()) return input.current.focus();
    if (active >= 0 && items[active]) return choose(items[active]);
    if (market && items[0]) return choose(items[0]);
    const request = generation.current;
    setBusy(true);
    try { const item = await overview.resolveAsset(query); if (request === generation.current && item.symbol) choose(item); }
    catch { if (request === generation.current) { setMessage('Arama servisine ulaşılamadı.'); setOpen(true); } }
    finally { setBusy(false); }
  };
  return <form className={market ? 'market-settings-search' : 'favorite-add-search'} role="search" onSubmit={submit}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label className="sr-only" htmlFor={id}>{market ? 'Piyasa verisi ara' : 'Favorilere eklenecek hisseyi ara'}</label>
    <input id={id} ref={input} type="search" role="combobox" aria-autocomplete="list" aria-controls={listId}
      aria-expanded={open && Boolean(items.length || message)} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
      autoComplete="off" maxLength={market ? undefined : 20} placeholder={market ? 'Piyasa verisi ara' : 'Favorilere hisse ekle'}
      value={query} onChange={event => { generation.current++; setQuery(event.target.value); }}
      onFocus={() => { if (items.length || message) setOpen(true); }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1); }
        else if (['ArrowDown', 'ArrowUp'].includes(event.key) && items.length) {
          event.preventDefault(); setOpen(true); setActive(index => index < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
        }
      }} />
    <button type="submit" disabled={busy} aria-label={market ? 'Piyasa verisi ekle' : 'Hisseyi favorilere ekle'}>+</button>
    <ul id={listId} ref={list} className={`search-suggestions ${open && (items.length || message) ? 'visible' : ''}`} role="listbox"
      aria-label={market ? 'Piyasa verisi önerileri' : 'Favorilere eklenecek hisse önerileri'}>
      {items.map((item, index) => <li key={item.symbol}><button id={`${listId}-${index}`} className="suggestion" type="button" role="option"
        aria-selected={index === active} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}>
        {overview.displaySymbol(item.symbol)} · {item.name || item.symbol}
      </button></li>)}
      {!items.length && message ? <li className="suggestion-empty" role="status">{message}</li> : null}
    </ul>
  </form>;
}
