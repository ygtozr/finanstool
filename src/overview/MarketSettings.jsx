import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Popup } from 'framework7-react';
import { AssetSearch } from './AssetSearch';
import { overview } from './legacy-adapter';

function MarketSettingRow({ item, order }) {
  const row = useRef(null), handle = useRef(null), keyboard = useRef(false);
  useEffect(() => {
    window.OzerNativeUI.reorder(handle.current, row.current, row.current.parentNode, ':scope > .market-settings-row', () => {
      const container = row.current.parentNode, focused = keyboard.current;
      overview.reorderMarkets([...container.children].map(node => node.dataset.symbol));
      if (focused) requestAnimationFrame(() => [...container.children].find(node => node.dataset.symbol === item.symbol)?.querySelector('[role=button]')?.focus());
    });
  }, [order]);
  return <div ref={row} className="market-settings-row" data-symbol={item.symbol}>
    <span ref={handle} onKeyDownCapture={event => { keyboard.current = event.altKey && event.key.startsWith("Arrow"); }} onPointerDownCapture={() => { keyboard.current = false; }} tabIndex={0} role="button" aria-label={`${item.label} sırasını değiştir`}>{item.label} <small>· {overview.displaySymbol(item.symbol)}</small></span>
    <button type="button" className="market-settings-remove" aria-label={`${item.label} verisini kaldır`} onClick={() => overview.removeMarket(item.symbol)}>×</button>
  </div>;
}
export function MarketSettings({ opened, onClose, items }) {
  const popup = useRef(null), opener = useRef(null), locks = useRef([]);
  const order = items.map(item => item.symbol).join('|');
  const unlock = () => { locks.current.forEach(([node, inert]) => { node.inert = inert; }); locks.current = []; overview.sheetOpen(false); };
  // Controlled Popup emits its opening event before React reattaches listeners.
  // Acquire the lock in our layout effect, before the browser can accept input.
  useLayoutEffect(() => {
    if (!opened) return;
    opener.current = document.activeElement;
    locks.current = [...document.querySelectorAll('body > main, #pilot-navigation, .desktop-sidebar')].map(node => [node, node.inert]);
    locks.current.forEach(([node]) => { node.inert = true; }); overview.sheetOpen(true);
  }, [opened]);
  useEffect(() => {
    const element = popup.current.el;
    const keydown = event => {
      if (event.key !== 'Tab') return;
      const controls = [...element.querySelectorAll('input, button:not(:disabled), [tabindex="0"]')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    element.addEventListener('keydown', keydown);
    return () => { element.removeEventListener('keydown', keydown); unlock(); };
  }, []);
  return createPortal(<Popup ref={popup} className="pilot-market-popup" opened={opened} containerEl="body" backdrop closeByBackdropClick closeOnEscape
    onPopupOpened={() => popup.current.el.querySelector('input')?.focus()}
    onPopupClosed={() => { unlock(); onClose(); if (opener.current?.isConnected) opener.current.focus(); }}>
    <section className="portfolio-dialog" role="dialog" aria-modal="true" aria-labelledby="pilotMarketSettingsTitle">
      <h3 id="pilotMarketSettingsTitle">Piyasa Özetini Düzenle</h3>
      <p className="portfolio-dialog-symbol">Arayarak ekleyin; sıralamak için basılı tutup sürükleyin. Çarpıyla kaldırın.</p>
      <AssetSearch kind="market" onAdd={overview.addMarket} />
      <div className="market-settings-list">{items.map(item => <MarketSettingRow key={`${item.symbol}:${order}`} item={item} order={order} />)}
        {!items.length ? <p className="market-settings-empty">Piyasa özetinde gösterilecek veri yok.</p> : null}</div>
      <div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onClose}>Kapat</button></div>
    </section>
  </Popup>, document.body);
}
